import dotenv from "dotenv";
import { randomUUID } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { reservationRooms } from "../../src/db/schema/reservation-rooms";
import { reservations } from "../../src/db/schema/reservations";
import { rooms } from "../../src/db/schema/rooms";
import { roomCategories } from "../../src/db/schema/room-categories";

describe.skipIf(process.env.RUN_DB_TESTS !== "1")(
  "reservation database integrity",
  () => {
    let db: typeof import("../../src/db").db;

    beforeAll(async () => {
      dotenv.config({ path: ".env.local" });
      ({ db } = await import("../../src/db"));
    });

    it(
      "rejects overlapping physical-room assignments",
      async () => {
        const [category] = await db
          .select({
            id: roomCategories.id,
            hotelId: roomCategories.hotelId,
            basePrice: roomCategories.basePrice,
          })
          .from(roomCategories)
          .limit(1);

        expect(category).toBeDefined();
        if (!category) return;

        await expect(
          db.transaction(async (tx) => {
            const suffix = randomUUID()
              .replaceAll("-", "")
              .slice(0, 12);

            const [room] = await tx
              .insert(rooms)
              .values({
                roomCategoryId: category.id,
                roomNumber: `TEST-${suffix}`,
                status: "available",
              })
              .returning({ id: rooms.id });

            const [first] = await tx
              .insert(reservations)
              .values({
                hotelId: category.hotelId,
                roomCategoryId: category.id,
                confirmationCode: `TEST-${suffix}-A`,
                status: "confirmed",
                checkIn: "2099-10-10",
                checkOut: "2099-10-14",
                adults: 1,
                children: 0,
                guestName: "Test Guest",
                guestEmail: "test@example.com",
                currency: "USD",
                pricePerNight: category.basePrice,
                totalAmount: category.basePrice,
              })
              .returning({ id: reservations.id });

            const [second] = await tx
              .insert(reservations)
              .values({
                hotelId: category.hotelId,
                roomCategoryId: category.id,
                confirmationCode: `TEST-${suffix}-B`,
                status: "confirmed",
                checkIn: "2099-10-11",
                checkOut: "2099-10-13",
                adults: 1,
                children: 0,
                guestName: "Test Guest",
                guestEmail: "test@example.com",
                currency: "USD",
                pricePerNight: category.basePrice,
                totalAmount: category.basePrice,
              })
              .returning({ id: reservations.id });

            await tx.insert(reservationRooms).values({
              reservationId: first.id,
              roomId: room.id,
              stayRange: "[2099-10-10,2099-10-14)",
              blocksInventory: true,
            });

            let errorCode: unknown;

            try {
              await tx.insert(reservationRooms).values({
                reservationId: second.id,
                roomId: room.id,
                stayRange: "[2099-10-11,2099-10-13)",
                blocksInventory: true,
              });
            } catch (error) {
              if (typeof error === "object" && error !== null) {
                const driverError = error as {
                  code?: unknown;
                  cause?: { code?: unknown };
                };

                errorCode =
                  driverError.code ?? driverError.cause?.code;
              }
            }

            expect(errorCode).toBe("23P01");

            throw new Error("rollback reservation integrity fixture");
          }),
        ).rejects.toThrow("rollback reservation integrity fixture");
      },
      30_000,
    );

    it(
      "allows only one of two concurrent overlapping room assignments",
      async () => {
        const [category] = await db
          .select({
            id: roomCategories.id,
            hotelId: roomCategories.hotelId,
            basePrice: roomCategories.basePrice,
          })
          .from(roomCategories)
          .limit(1);

        expect(category).toBeDefined();

        if (!category) return;

        const suffix = randomUUID()
          .replaceAll("-", "")
          .slice(0, 12);

        let fixture:
          | {
              roomId: string;
              firstReservationId: string;
              secondReservationId: string;
            }
          | undefined;

        try {
          fixture = await db.transaction(async (tx) => {
            const [room] = await tx
              .insert(rooms)
              .values({
                roomCategoryId: category.id,
                roomNumber: `TEST-${suffix}`,
                status: "available",
              })
              .returning({ id: rooms.id });

            const [first] = await tx
              .insert(reservations)
              .values({
                hotelId: category.hotelId,
                roomCategoryId: category.id,
                confirmationCode: `TEST-${suffix}-A`,
                status: "confirmed",
                checkIn: "2099-10-10",
                checkOut: "2099-10-14",
                adults: 1,
                children: 0,
                guestName: "Concurrent Test Guest",
                guestEmail: "test@example.com",
                currency: "USD",
                pricePerNight: category.basePrice,
                totalAmount: category.basePrice,
              })
              .returning({ id: reservations.id });

            const [second] = await tx
              .insert(reservations)
              .values({
                hotelId: category.hotelId,
                roomCategoryId: category.id,
                confirmationCode: `TEST-${suffix}-B`,
                status: "confirmed",
                checkIn: "2099-10-11",
                checkOut: "2099-10-13",
                adults: 1,
                children: 0,
                guestName: "Concurrent Test Guest",
                guestEmail: "test@example.com",
                currency: "USD",
                pricePerNight: category.basePrice,
                totalAmount: category.basePrice,
              })
              .returning({ id: reservations.id });

            return {
              roomId: room.id,
              firstReservationId: first.id,
              secondReservationId: second.id,
            };
          });

          const attempts = await Promise.allSettled([
            db.transaction(async (tx) => {
              await tx.insert(reservationRooms).values({
                reservationId: fixture!.firstReservationId,
                roomId: fixture!.roomId,
                stayRange: "[2099-10-10,2099-10-14)",
                blocksInventory: true,
              });
            }),

            db.transaction(async (tx) => {
              await tx.insert(reservationRooms).values({
                reservationId: fixture!.secondReservationId,
                roomId: fixture!.roomId,
                stayRange: "[2099-10-11,2099-10-13)",
                blocksInventory: true,
              });
            }),
          ]);

          const successes = attempts.filter(
            (attempt) => attempt.status === "fulfilled",
          );

          const failures = attempts.filter(
            (attempt) => attempt.status === "rejected",
          );

          expect(successes).toHaveLength(1);
          expect(failures).toHaveLength(1);

          const rejectedAttempt = failures[0];

          if (rejectedAttempt?.status === "rejected") {
            const error = rejectedAttempt.reason as {
              code?: unknown;
              cause?: { code?: unknown };
            };

            expect(
              error.code ?? error.cause?.code,
            ).toBe("23P01");
          }
        } finally {
          if (fixture) {
            await db.transaction(async (tx) => {
              await tx
                .delete(reservationRooms)
                .where(
                  eq(
                    reservationRooms.reservationId,
                    fixture!.firstReservationId,
                  ),
                );

              await tx
                .delete(reservationRooms)
                .where(
                  eq(
                    reservationRooms.reservationId,
                    fixture!.secondReservationId,
                  ),
                );

              await tx
                .delete(reservations)
                .where(
                  eq(
                    reservations.id,
                    fixture!.firstReservationId,
                  ),
                );

              await tx
                .delete(reservations)
                .where(
                  eq(
                    reservations.id,
                    fixture!.secondReservationId,
                  ),
                );

              await tx
                .delete(rooms)
                .where(eq(rooms.id, fixture!.roomId));
            });
          }
        }
      },
      30_000,
    );
  },
);