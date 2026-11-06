import dotenv from "dotenv";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";

import { reservationEvents } from "../../src/db/schema/reservation-events";
import { reservationRooms } from "../../src/db/schema/reservation-rooms";
import { reservations } from "../../src/db/schema/reservations";
import { rooms } from "../../src/db/schema/rooms";
import { roomCategories } from "../../src/db/schema/room-categories";
import { user } from "../../src/db/schema/auth-schema";

describe.skipIf(process.env.RUN_DB_TESTS !== "1")(
  "reservation expiration persistence",
  () => {
    let db: typeof import("../../src/db").db;

    let expireCustomerReservationIfNeeded: (
      reservationId: string,
    ) => Promise<boolean>;

    beforeAll(async () => {
      dotenv.config({ path: ".env.local" });

      ({ db } = await import("../../src/db"));
    });

    afterAll(() => {
      vi.doUnmock("@/src/lib/auth/server");
      vi.resetModules();
    });

    it(
      "expires an overdue hold, releases inventory, and saves the audit event",
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

        const [testUser] = await db
          .select({ id: user.id })
          .from(user)
          .limit(1);

        expect(testUser).toBeDefined();
        if (!testUser) return;

        const suffix = randomUUID().replaceAll("-", "").slice(0, 12);

        let fixture:
          | {
              roomId: string;
              reservationId: string;
            }
          | undefined;

        try {
          const [created] = await db.transaction(async (tx) => {
            const [room] = await tx
              .insert(rooms)
              .values({
                roomCategoryId: category.id,
                roomNumber: `TEST-${suffix}`,
                status: "available",
              })
              .returning({ id: rooms.id });

            const pricePerNight = Number(category.basePrice);

            const [reservation] = await tx
              .insert(reservations)
              .values({
                hotelId: category.hotelId,
                roomCategoryId: category.id,
                confirmationCode: `TEST-${suffix}`,
                status: "held",
                checkIn: "2099-10-10",
                checkOut: "2099-10-12",
                adults: 1,
                children: 0,
                guestName: "Expiration Test Guest",
                guestEmail: "expiration-test@example.com",
                customerId: testUser.id,
                currency: "USD",
                pricePerNight: pricePerNight.toFixed(2),
                totalAmount: (pricePerNight * 2).toFixed(2),
                expiresAt: new Date(Date.now() - 60_000),
              })
              .returning({ id: reservations.id });

            await tx.insert(reservationRooms).values({
              reservationId: reservation.id,
              roomId: room.id,
              stayRange: "[2099-10-10,2099-10-12)",
              blocksInventory: true,
            });

            return [
              {
                roomId: room.id,
                reservationId: reservation.id,
              },
            ];
          });

          fixture = created;

          vi.resetModules();

          vi.doMock("@/src/lib/auth/server", () => ({
            requireAuthenticatedUser: vi.fn(async () => ({
              user: { id: testUser.id },
            })),
            requireStaff: vi.fn(),
            requireAdmin: vi.fn(),
          }));

          ({ expireCustomerReservationIfNeeded } = await import(
            "../../src/lib/reservations/actions"
          ));

          const expired = await expireCustomerReservationIfNeeded(
            fixture.reservationId,
          );

          expect(expired).toBe(true);

          // A second expiration attempt should be idempotent.
          const expiredAgain = await expireCustomerReservationIfNeeded(
            fixture.reservationId,
          );

          expect(expiredAgain).toBe(false);

          const [savedReservation] = await db
            .select({
              status: reservations.status,
            })
            .from(reservations)
            .where(eq(reservations.id, fixture.reservationId));

          expect(savedReservation?.status).toBe("expired");

          const [savedAssignment] = await db
            .select({
              blocksInventory: reservationRooms.blocksInventory,
            })
            .from(reservationRooms)
            .where(
              eq(
                reservationRooms.reservationId,
                fixture.reservationId,
              ),
            );

          expect(savedAssignment?.blocksInventory).toBe(false);

          const [savedRoom] = await db
            .select({
              status: rooms.status,
            })
            .from(rooms)
            .where(eq(rooms.id, fixture.roomId));

          // Expiration must not change the room's operational status.
          expect(savedRoom?.status).toBe("available");

          const [savedEvent] = await db
            .select({
              eventType: reservationEvents.eventType,
              fromStatus: reservationEvents.fromStatus,
              toStatus: reservationEvents.toStatus,
              metadata: reservationEvents.metadata,
            })
            .from(reservationEvents)
            .where(
              eq(
                reservationEvents.reservationId,
                fixture.reservationId,
              ),
            );

          expect(savedEvent).toBeDefined();
          expect(savedEvent?.eventType).toBe("reservation.expired");
          expect(savedEvent?.fromStatus).toBe("held");
          expect(savedEvent?.toStatus).toBe("expired");
          expect(savedEvent?.metadata).toMatchObject({
            reason: "hold_expired",
            inventoryReleased: true,
          });
        } finally {
          if (fixture) {
            await db.transaction(async (tx) => {
              await tx
                .delete(reservationEvents)
                .where(
                  eq(
                    reservationEvents.reservationId,
                    fixture!.reservationId,
                  ),
                );

              await tx
                .delete(reservationRooms)
                .where(
                  eq(
                    reservationRooms.reservationId,
                    fixture!.reservationId,
                  ),
                );

              await tx
                .delete(reservations)
                .where(eq(reservations.id, fixture!.reservationId));

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
