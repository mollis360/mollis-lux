import { and, eq, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

import { db } from "@/src/db";
import { roomCategories } from "@/src/db/schema/room-categories";
import { getHotelOrThrow } from "@/src/lib/hotel/queries";
import { ActionError, runSafeAction } from "@/src/lib/errors";
import { releaseExpiredReservations } from "@/src/lib/reservations/expiration";
import {
  centsToMoney,
  moneyToCents,
} from "@/src/lib/reservations/money";
import {
  isValidStayRange,
  nightsBetween,
  todayInTimeZone,
  toDateRangeLiteral,
} from "./date-utils";
import {
  availabilityRequestSchema,
  type AvailabilityRequest,
} from "./validation";

type SqlExecutor = {
  execute(query: SQL): Promise<unknown>;
};

export type AvailableRoom = {
  id: string;
  roomNumber: string;
};

export type AvailabilityResult = {
  available: boolean;
  rooms: AvailableRoom[];
  nights: number;
  currency: string;
  pricePerNight?: string;
  totalAmount?: string;
  reason?: string;
};

function inventoryPredicate(request: AvailabilityRequest) {
  return sql`
    NOT EXISTS (
      SELECT 1
      FROM "reservation_rooms" AS rr
      INNER JOIN "reservations" AS existing_reservation
        ON existing_reservation."id" = rr."reservationId"
      WHERE rr."roomId" = "rooms"."id"
        AND rr."blocksInventory" = true
        AND rr."stayRange" && ${toDateRangeLiteral(
          request.checkIn,
          request.checkOut,
        )}::daterange
        AND (
          existing_reservation."status" IN (
            'held',
            'confirmed',
            'checked_in'
          )
          OR (
            existing_reservation."status" = 'pending'
            AND (
              existing_reservation."expiresAt" IS NULL
              OR existing_reservation."expiresAt" > now()
            )
          )
        )
    )
  `;
}

export async function findAvailableRooms(
  executor: SqlExecutor,
  request: AvailabilityRequest,
): Promise<AvailableRoom[]> {
  const result = await executor.execute(sql`
    SELECT
      "rooms"."id" AS "id",
      "rooms"."roomNumber" AS "roomNumber"
    FROM "rooms"
    WHERE "rooms"."roomCategoryId" = ${request.roomCategoryId}
      AND "rooms"."status" = 'available'
      AND (
        ${request.roomId
          ? sql`"rooms"."id" = ${request.roomId}`
          : sql`true`}
      )
      AND ${inventoryPredicate(request)}
    ORDER BY "rooms"."roomNumber" ASC
  `);

  const rows = Array.isArray(result)
    ? result
    : typeof result === "object" &&
        result !== null &&
        "rows" in result &&
        Array.isArray(result.rows)
      ? result.rows
      : [];

  return rows.filter(isAvailableRoom);
}

function isAvailableRoom(value: unknown): value is AvailableRoom {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "roomNumber" in value &&
    typeof value.id === "string" &&
    typeof value.roomNumber === "string"
  );
}

export async function getAvailability(
  input: unknown,
): Promise<AvailabilityResult> {
  return runSafeAction(
    "check room availability",
    async () => {
      const request = availabilityRequestSchema.parse(input);
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

      const [category] = await db
        .select({
          id: roomCategories.id,
          name: roomCategories.name,
          maxAdults: roomCategories.maxAdults,
          maxChildren: roomCategories.maxChildren,
          pricePerNight: roomCategories.basePrice,
        })
        .from(roomCategories)
        .where(
          and(
            eq(roomCategories.id, request.roomCategoryId),
            eq(roomCategories.status, "active"),
          ),
        )
        .limit(1);

      if (!category) {
        throw new ActionError(
          "NOT_FOUND",
          "Room category not found.",
        );
      }

      const nights = nightsBetween(
        request.checkIn,
        request.checkOut,
      );

      if (
        request.adults > category.maxAdults ||
        request.children > category.maxChildren
      ) {
        return {
          available: false,
          rooms: [],
          nights,
          currency: hotel.currency,
          reason:
            "This room category cannot accommodate the selected guests.",
        };
      }

      const rooms = await db.transaction(async (tx) => {
        await releaseExpiredReservations(tx);
        return findAvailableRooms(tx, request);
      });

      return {
        available: rooms.length > 0,
        rooms,
        nights,
        currency: hotel.currency,
        pricePerNight: category.pricePerNight,
        totalAmount: centsToMoney(
          moneyToCents(category.pricePerNight) * BigInt(nights),
        ),
        reason:
          rooms.length > 0
            ? undefined
            : request.roomId
              ? "This specific room is not available for those dates. Please choose another room or select the room category to find another available room."
              : "No rooms in this category are available for those dates.",
      };
    },
    "Availability could not be checked.",
  );
}
