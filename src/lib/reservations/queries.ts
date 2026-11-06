import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
  sql,
} from "drizzle-orm";

import { z } from "zod";

import { db } from "@/src/db";

import {
  reservations,
  type ReservationStatus,
} from "@/src/db/schema/reservations";

import { reservationEvents } from "@/src/db/schema/reservation-events";

import { reservationRooms } from "@/src/db/schema/reservation-rooms";

import { rooms } from "@/src/db/schema/rooms";

import { roomCategories } from "@/src/db/schema/room-categories";

export type ReservationListFilters = {
  limit?: number;
  offset?: number;
  status?: ReservationStatus;
  search?: string;
  checkInFrom?: string;
  checkInTo?: string;
};

const ACTIVE_RESERVATION_STATUSES: ReservationStatus[] = [
  "pending",
  "held",
  "confirmed",
  "checked_in",
];

function reservationFilters(filters: ReservationListFilters) {
  const conditions = [];

  if (filters.status) {
    conditions.push(
      eq(reservations.status, filters.status),
    );
  }

  if (filters.checkInFrom) {
    conditions.push(
      gte(
        reservations.checkIn,
        filters.checkInFrom,
      ),
    );
  }

  if (filters.checkInTo) {
    conditions.push(
      lte(
        reservations.checkIn,
        filters.checkInTo,
      ),
    );
  }

  const search = filters.search?.trim();

  if (search) {
    const term = `%${search}%`;

    conditions.push(
      or(
        ilike(
          reservations.confirmationCode,
          term,
        ),
        ilike(
          reservations.guestName,
          term,
        ),
        ilike(
          reservations.guestEmail,
          term,
        ),
      ),
    );
  }

  return conditions.length > 0
    ? and(...conditions)
    : undefined;
}

export async function getReservations(
  filters: ReservationListFilters = {},
) {
  const limit = Math.min(
    Math.max(filters.limit ?? 50, 1),
    100,
  );

  const offset = Math.max(
    filters.offset ?? 0,
    0,
  );

  return db
    .select({
      id: reservations.id,
      confirmationCode:
        reservations.confirmationCode,
      status: reservations.status,
      checkIn: reservations.checkIn,
      checkOut: reservations.checkOut,
      adults: reservations.adults,
      children: reservations.children,
      guestName: reservations.guestName,
      guestEmail: reservations.guestEmail,
      createdAt: reservations.createdAt,
      categoryName: roomCategories.name,

      roomNumbers: sql<string[]>`
        COALESCE(
          (
            SELECT array_agg(
              ${rooms.roomNumber}
              ORDER BY ${rooms.roomNumber}
            )
            FROM ${reservationRooms}
            INNER JOIN ${rooms}
              ON ${rooms.id} = ${reservationRooms.roomId}
            WHERE ${reservationRooms.reservationId} = ${reservations.id}
          ),
          ARRAY[]::text[]
        )
      `,
    })
    .from(reservations)
    .leftJoin(
      roomCategories,
      eq(
        reservations.roomCategoryId,
        roomCategories.id,
      ),
    )
    .where(reservationFilters(filters))
    .orderBy(desc(reservations.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function countReservations(
  filters: Omit<
    ReservationListFilters,
    "limit" | "offset"
  > = {},
) {
  const [result] = await db
    .select({
      value: count(),
    })
    .from(reservations)
    .where(reservationFilters(filters));

  return result?.value ?? 0;
}

export async function getActiveReservationCount() {
  const [result] = await db
    .select({
      value: count(),
    })
    .from(reservations)
    .where(
      inArray(
        reservations.status,
        ACTIVE_RESERVATION_STATUSES,
      ),
    );

  return result?.value ?? 0;
}

export async function getReservationById(
  id: string,
) {
  const details = await getReservationDetails(id);

  if (!details) {
    return null;
  }

  const {
    rooms: assignedRooms,
    events,
    ...reservation
  } = details;

  const assignment = assignedRooms[0]
    ? {
        roomNumber:
          assignedRooms[0].roomNumber,
        roomId: assignedRooms[0].roomId,
      }
    : null;

  return {
    reservation,
    assignment,
    events,
  };
}

export async function getReservationDetails(
  id: string,
) {
  const validId = z.uuid().safeParse(id);

  if (!validId.success) {
    return null;
  }

  const [reservation] = await db
    .select()
    .from(reservations)
    .where(
      eq(
        reservations.id,
        validId.data,
      ),
    )
    .limit(1);

  if (!reservation) {
    return null;
  }

  const assignedRooms = await db
    .select({
      id: reservationRooms.id,
      roomId: reservationRooms.roomId,
      roomNumber: rooms.roomNumber,
      name: rooms.name,
      floor: rooms.floor,
      blocksInventory:
        reservationRooms.blocksInventory,
      stayRange: reservationRooms.stayRange,
    })
    .from(reservationRooms)
    .leftJoin(
      rooms,
      eq(
        reservationRooms.roomId,
        rooms.id,
      ),
    )
    .where(
      eq(
        reservationRooms.reservationId,
        validId.data,
      ),
    );

  const events = await db
    .select()
    .from(reservationEvents)
    .where(
      eq(
        reservationEvents.reservationId,
        validId.data,
      ),
    )
    .orderBy(
      desc(reservationEvents.createdAt),
    );

  return {
    ...reservation,
    rooms: assignedRooms,
    events,
  };
}

export async function getReservationsForCustomer(
  customerId: string,
) {
  return db
    .select({
      id: reservations.id,
      confirmationCode:
        reservations.confirmationCode,
      status: reservations.status,
      checkIn: reservations.checkIn,
      checkOut: reservations.checkOut,
      categoryName: roomCategories.name,
      totalAmount: reservations.totalAmount,
      currency: reservations.currency,
      expiresAt: reservations.expiresAt,
    })
    .from(reservations)
    .innerJoin(
      roomCategories,
      eq(
        reservations.roomCategoryId,
        roomCategories.id,
      ),
    )
    .where(
      eq(
        reservations.customerId,
        customerId,
      ),
    )
    .orderBy(
      desc(reservations.createdAt),
    );
}

export async function getCustomerReservationById(
  id: string,
  customerId: string,
) {
  const validId = z.uuid().safeParse(id);

  if (!validId.success) {
    return null;
  }

  const [reservation] = await db
    .select({
      id: reservations.id,
      confirmationCode:
        reservations.confirmationCode,
      status: reservations.status,
      checkIn: reservations.checkIn,
      checkOut: reservations.checkOut,
      adults: reservations.adults,
      children: reservations.children,
      guestName: reservations.guestName,
      guestEmail: reservations.guestEmail,
      guestPhone: reservations.guestPhone,
      currency: reservations.currency,
      pricePerNight:
        reservations.pricePerNight,
      totalAmount: reservations.totalAmount,
      expiresAt: reservations.expiresAt,
      createdAt: reservations.createdAt,
      categoryName: roomCategories.name,
    })
    .from(reservations)
    .innerJoin(
      roomCategories,
      eq(
        reservations.roomCategoryId,
        roomCategories.id,
      ),
    )
    .where(
      and(
        eq(
          reservations.id,
          validId.data,
        ),
        eq(
          reservations.customerId,
          customerId,
        ),
      ),
    )
    .limit(1);

  return reservation ?? null;
}