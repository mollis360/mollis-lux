"use server";

import { and, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { db } from "@/src/db";
import { reservationEvents } from "@/src/db/schema/reservation-events";
import { reservationRooms } from "@/src/db/schema/reservation-rooms";
import {
  reservations,
  type ReservationStatus,
} from "@/src/db/schema/reservations";
import { roomCategories } from "@/src/db/schema/room-categories";
import {
  requireAuthenticatedUser,
  requireStaff,
} from "@/src/lib/auth/server";
import { getHotelOrThrow } from "@/src/lib/hotel/queries";
import { runSafeAction, ActionError } from "@/src/lib/errors";
import { findAvailableRooms } from "@/src/lib/availability/queries";
import {
  isValidStayRange,
  nightsBetween,
  todayInTimeZone,
  toDateRangeLiteral,
} from "@/src/lib/availability/date-utils";
import { releaseExpiredReservations } from "@/src/lib/reservations/expiration";

import { reservationRequestSchema } from "./validation";
import { centsToMoney, moneyToCents } from "./money";
import {
  canTransitionReservation,
  getReservationTransitions,
} from "./state";
import { getReservationHoldExpiration } from "./hold";

const reservationStatusSchema = z.enum([
  "pending",
  "held",
  "confirmed",
  "cancelled",
  "expired",
  "checked_in",
  "checked_out",
  "no_show",
]);

const transitionRequestSchema = z.object({
  reservationId: z.uuid("Invalid reservation ID."),
  toStatus: reservationStatusSchema,
  cancellationReason: z
    .string()
    .trim()
    .max(1000, "Cancellation reason is too long.")
    .optional()
    .or(z.literal("")),
});

const transitionEventTypes = {
  held: "reservation.held",
  confirmed: "reservation.confirmed",
  cancelled: "reservation.cancelled",
  expired: "reservation.expired",
  checked_in: "reservation.checked_in",
  checked_out: "reservation.checked_out",
  no_show: "reservation.no_show",
} as const;

export async function createReservation(input: unknown) {
  const session = await requireAuthenticatedUser({
    disableCookieCache: true,
  });

  return runSafeAction(
    "create reservation",
    async () => {
      const request = reservationRequestSchema.parse(input);
      const hotel = await getHotelOrThrow();

      if (!isValidStayRange(request.checkIn, request.checkOut)) {
        throw new ActionError(
          "VALIDATION",
          "Check-out must be after check-in.",
        );
      }

      if (request.checkIn < todayInTimeZone(hotel.timezone)) {
        throw new ActionError(
          "VALIDATION",
          "Check-in cannot be in the past.",
        );
      }

      // Commit expired-hold cleanup separately so a failed booking
      // cannot undo inventory released by this cleanup.
      await db.transaction(async (tx) => {
        await releaseExpiredReservations(tx);
      });

      return db.transaction(async (tx) => {
        // Find an existing request before checking availability.
        // A retry must be able to retrieve its original reservation
        // even though that reservation already blocks the room.
        const getExistingReservationForKey = async () => {
          const [existing] = await tx
            .select()
            .from(reservations)
            .where(
              and(
                eq(reservations.customerId, session.user.id),
                eq(
                  reservations.idempotencyKey,
                  request.idempotencyKey,
                ),
              ),
            )
            .limit(1);

          if (!existing) {
            return null;
          }

          // An idempotency key can only be reused for the same
          // booking request, not for a different reservation.
          const matchesRequest =
            existing.hotelId === hotel.id &&
            existing.roomCategoryId === request.roomCategoryId &&
            existing.checkIn === request.checkIn &&
            existing.checkOut === request.checkOut &&
            existing.adults === request.adults &&
            existing.children === request.children &&
            existing.guestName === request.guestName &&
            existing.guestEmail === session.user.email &&
            existing.guestPhone === (request.guestPhone || null);

          if (!matchesRequest) {
            throw new ActionError(
              "CONFLICT",
              "This booking request key has already been used for different reservation details. Please start a new booking.",
            );
          }

          // If a specific room was requested, make sure the existing
          // reservation actually holds that room.
          if (request.roomId) {
            const [assignment] = await tx
              .select({
                roomId: reservationRooms.roomId,
              })
              .from(reservationRooms)
              .where(
                eq(reservationRooms.reservationId, existing.id),
              )
              .limit(1);

            if (assignment?.roomId !== request.roomId) {
              throw new ActionError(
                "CONFLICT",
                "This booking request key was already used for a different room selection. Please start a new booking.",
              );
            }
          }

          return existing;
        };

        const existingReservation =
          await getExistingReservationForKey();

        if (existingReservation) {
          return existingReservation;
        }

        const [category] = await tx
          .select({
            id: roomCategories.id,
            hotelId: roomCategories.hotelId,
            maxAdults: roomCategories.maxAdults,
            maxChildren: roomCategories.maxChildren,
            pricePerNight: roomCategories.basePrice,
            status: roomCategories.status,
          })
          .from(roomCategories)
          .where(eq(roomCategories.id, request.roomCategoryId))
          .limit(1);

        if (
          !category ||
          category.hotelId !== hotel.id ||
          category.status !== "active"
        ) {
          throw new ActionError(
            "NOT_FOUND",
            "Room category not found.",
          );
        }

        if (
          request.adults > category.maxAdults ||
          request.children > category.maxChildren
        ) {
          throw new ActionError(
            "VALIDATION",
            "This room category cannot accommodate the selected guests.",
          );
        }

        // Check current room status, category, and overlapping
        // inventory before creating the reservation.
        const availableRooms = await findAvailableRooms(tx, request);
        const selectedRoom = availableRooms[0];

        if (!selectedRoom) {
          throw new ActionError(
            "CONFLICT",
            request.roomId
              ? "This specific room is no longer available for those dates. Please choose another room or book the category instead."
              : "No rooms in this category are available for those dates.",
          );
        }

        const nights = nightsBetween(
          request.checkIn,
          request.checkOut,
        );

        const totalAmount = centsToMoney(
          moneyToCents(category.pricePerNight) * BigInt(nights),
        );

        const confirmationCode = `MXL-${randomUUID()
          .replaceAll("-", "")
          .slice(0, 12)
          .toUpperCase()}`;

        const expiresAt = getReservationHoldExpiration();

        // Handle simultaneous requests with the same idempotency key
        // without aborting the PostgreSQL transaction. Only the
        // customer/key unique constraint is handled as a retry.
        const [createdReservation] = await tx
          .insert(reservations)
          .values({
            hotelId: hotel.id,
            customerId: session.user.id,
            roomCategoryId: category.id,
            confirmationCode,
            idempotencyKey: request.idempotencyKey,
            status: "held",
            checkIn: request.checkIn,
            checkOut: request.checkOut,
            adults: request.adults,
            children: request.children,
            guestName: request.guestName,
            guestEmail: session.user.email,
            guestPhone: request.guestPhone || null,
            currency: hotel.currency,
            pricePerNight: category.pricePerNight,
            totalAmount,
            expiresAt,
          })
          .onConflictDoNothing({
            target: [
              reservations.customerId,
              reservations.idempotencyKey,
            ],
          })
          .returning();

        if (!createdReservation) {
          // Another request may have inserted the same key while
          // this transaction was running. The transaction remains
          // usable because the conflict was handled by the INSERT.
          const concurrentReservation =
            await getExistingReservationForKey();

          if (concurrentReservation) {
            return concurrentReservation;
          }

          throw new ActionError(
            "CONFLICT",
            "This booking request could not be completed safely. Please start a new booking.",
          );
        }

        try {
          await tx.insert(reservationRooms).values({
            reservationId: createdReservation.id,
            roomId: selectedRoom.id,
            stayRange: toDateRangeLiteral(
              request.checkIn,
              request.checkOut,
            ),
            blocksInventory: true,
          });
        } catch (error) {
          const databaseError = error as {
            code?: unknown;
            cause?: { code?: unknown };
          };

          const errorCode =
            databaseError.code ?? databaseError.cause?.code;

          if (errorCode === "23P01") {
            throw new ActionError(
              "CONFLICT",
              "The selected room was booked by another reservation. Please try again.",
            );
          }

          throw error;
        }

        await tx.insert(reservationEvents).values({
          reservationId: createdReservation.id,
          actorUserId: session.user.id,
          eventType: "reservation.created",
          toStatus: "held",
          metadata: {
            roomId: selectedRoom.id,
            roomNumber: selectedRoom.roomNumber,
            nights,
            holdMinutes: 15,
          },
          note: "Reservation created as a 15-minute inventory hold. Payment and confirmation are not configured.",
        });

        return createdReservation;
      });
    },
    "The reservation could not be created.",
  );
}

export async function transitionReservationStatus(input: unknown) {
  const session = await requireStaff();

  return runSafeAction(
    "transition reservation status",
    async () => {
      const request = transitionRequestSchema.parse(input);

      if (!(request.toStatus in transitionEventTypes)) {
        throw new ActionError(
          "VALIDATION",
          "That reservation transition is not available.",
        );
      }

      const result = await db.transaction(async (tx) => {
        const [reservation] = await tx
          .select()
          .from(reservations)
          .where(eq(reservations.id, request.reservationId))
          .limit(1)
          .for("update");

        if (!reservation) {
          throw new ActionError(
            "NOT_FOUND",
            "Reservation not found.",
          );
        }

        const currentStatus =
          reservation.status as ReservationStatus;
        const now = new Date();

        if (
          ["pending", "held"].includes(currentStatus) &&
          reservation.expiresAt &&
          reservation.expiresAt <= now
        ) {
          await tx
            .update(reservations)
            .set({ status: "expired" })
            .where(eq(reservations.id, reservation.id));

          await tx
            .update(reservationRooms)
            .set({ blocksInventory: false })
            .where(
              eq(reservationRooms.reservationId, reservation.id),
            );

          await tx.insert(reservationEvents).values({
            reservationId: reservation.id,
            eventType: "reservation.expired",
            fromStatus: currentStatus,
            toStatus: "expired",
            actorUserId: session.user.id,
            metadata: {
              reason: "hold_expired_before_transition",
              inventoryReleased: true,
            },
            note: "The reservation hold expired before the requested status transition.",
          });

          return { expired: true as const };
        }

        if (
          !canTransitionReservation(
            currentStatus,
            request.toStatus,
          )
        ) {
          throw new ActionError(
            "VALIDATION",
            `A reservation cannot move from ${currentStatus.replace("_", " ")} to ${request.toStatus.replace("_", " ")}.`,
          );
        }

        const [assignment] = await tx
          .select({
            id: reservationRooms.id,
            roomId: reservationRooms.roomId,
            blocksInventory: reservationRooms.blocksInventory,
          })
          .from(reservationRooms)
          .where(
            eq(reservationRooms.reservationId, reservation.id),
          )
          .limit(1);

        if (
          ["confirmed", "checked_in"].includes(request.toStatus) &&
          !assignment
        ) {
          throw new ActionError(
            "CONFLICT",
            "A physical room must be assigned before this reservation can be confirmed.",
          );
        }

        if (request.toStatus === "checked_in") {
          const hotel = await getHotelOrThrow();
          const today = todayInTimeZone(hotel.timezone);

          if (today < reservation.checkIn) {
            throw new ActionError(
              "VALIDATION",
              "This reservation cannot be checked in before the check-in date.",
            );
          }

          if (today >= reservation.checkOut) {
            throw new ActionError(
              "VALIDATION",
              "This reservation has already passed its check-out date.",
            );
          }
        }

        if (request.toStatus === "no_show") {
          const hotel = await getHotelOrThrow();
          const today = todayInTimeZone(hotel.timezone);

          if (today < reservation.checkIn) {
            throw new ActionError(
              "VALIDATION",
              "A reservation cannot be marked no-show before its check-in date.",
            );
          }
        }

        const releasesInventory = [
          "cancelled",
          "expired",
          "no_show",
        ].includes(request.toStatus);

        const cancellationReason =
          request.cancellationReason?.trim() ||
          "Cancelled by hotel operations. Payment/refund policy is not configured.";

        await tx
          .update(reservations)
          .set({
            status: request.toStatus,
            expiresAt:
              request.toStatus === "confirmed"
                ? null
                : reservation.expiresAt,
            cancelledAt:
              request.toStatus === "cancelled"
                ? new Date()
                : reservation.cancelledAt,
            cancellationReason:
              request.toStatus === "cancelled"
                ? cancellationReason
                : reservation.cancellationReason,
          })
          .where(eq(reservations.id, reservation.id));

        if (releasesInventory) {
          await tx
            .update(reservationRooms)
            .set({ blocksInventory: false })
            .where(
              eq(reservationRooms.reservationId, reservation.id),
            );
        }

        await tx.insert(reservationEvents).values({
          reservationId: reservation.id,
          actorUserId: session.user.id,
          eventType:
            transitionEventTypes[
              request.toStatus as keyof typeof transitionEventTypes
            ],
          fromStatus: currentStatus,
          toStatus: request.toStatus,
          metadata: {
            inventoryReleased: releasesInventory,
          },
          note:
            request.toStatus === "cancelled"
              ? cancellationReason
              : undefined,
        });

        return {
          expired: false as const,
          id: reservation.id,
          status: request.toStatus,
          allowedNextStatuses: getReservationTransitions(
            request.toStatus,
          ),
        };
      });

      if (result.expired) {
        throw new ActionError(
          "CONFLICT",
          request.toStatus === "confirmed"
            ? "This reservation hold has expired and cannot be confirmed."
            : "This reservation hold has expired.",
        );
      }

      return {
        id: result.id,
        status: result.status,
        allowedNextStatuses: result.allowedNextStatuses,
      };
    },
    "The reservation status could not be updated.",
  );
}

export async function expireCustomerReservationIfNeeded(
  reservationId: string,
) {
  const session = await requireAuthenticatedUser({
    disableCookieCache: true,
  });

  return runSafeAction(
    "expire reservation hold",
    async () => {
      const validId = z
        .uuid("Invalid reservation ID.")
        .safeParse(reservationId);

      if (!validId.success) {
        throw new ActionError(
          "NOT_FOUND",
          "Reservation not found.",
        );
      }

      return db.transaction(async (tx) => {
        const [reservation] = await tx
          .select()
          .from(reservations)
          .where(
            and(
              eq(reservations.id, validId.data),
              eq(reservations.customerId, session.user.id),
            ),
          )
          .limit(1)
          .for("update");

        if (!reservation) {
          throw new ActionError(
            "NOT_FOUND",
            "Reservation not found.",
          );
        }

        if (
          !reservation.expiresAt ||
          reservation.expiresAt > new Date() ||
          !["pending", "held"].includes(reservation.status)
        ) {
          return false;
        }

        await tx
          .update(reservations)
          .set({ status: "expired" })
          .where(eq(reservations.id, reservation.id));

        await tx
          .update(reservationRooms)
          .set({ blocksInventory: false })
          .where(
            eq(reservationRooms.reservationId, reservation.id),
          );

        await tx.insert(reservationEvents).values({
          reservationId: reservation.id,
          eventType: "reservation.expired",
          actorUserId: session.user.id,
          fromStatus: reservation.status,
          toStatus: "expired",
          metadata: {
            reason: "hold_expired",
            inventoryReleased: true,
          },
          note: "The reservation hold expired. No payment was processed.",
        });

        return true;
      });
    },
    "The reservation status could not be refreshed.",
  );
}