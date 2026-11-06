
import { and, inArray, lte } from "drizzle-orm";

import { db } from "@/src/db";
import { reservationEvents } from "@/src/db/schema/reservation-events";
import { reservationRooms } from "@/src/db/schema/reservation-rooms";
import { reservations } from "@/src/db/schema/reservations";

type ReservationTransaction = Parameters<
  Parameters<typeof db.transaction>[0]
>[0];

export async function releaseExpiredReservations(
  tx: ReservationTransaction,
): Promise<number> {
  const now = new Date();

  const expiredReservations = await tx
    .select({
      id: reservations.id,
      status: reservations.status,
    })
    .from(reservations)
    .where(
      and(
        inArray(reservations.status, ["pending", "held"]),
        lte(reservations.expiresAt, now),
      ),
    )
    .for("update");

  if (expiredReservations.length === 0) {
    return 0;
  }

  const reservationIds = expiredReservations.map(
    (reservation) => reservation.id,
  );

  await tx
    .update(reservations)
    .set({
      status: "expired",
      updatedAt: now,
    })
    .where(inArray(reservations.id, reservationIds));

  await tx
    .update(reservationRooms)
    .set({
      blocksInventory: false,
    })
    .where(
      inArray(reservationRooms.reservationId, reservationIds),
    );

  await tx.insert(reservationEvents).values(
    expiredReservations.map((reservation) => ({
      reservationId: reservation.id,
      eventType: "reservation.expired",
      fromStatus: reservation.status,
      toStatus: "expired",
      metadata: {
        reason: "hold_expired",
        inventoryReleased: true,
      },
      note:
        "The reservation hold expired automatically. No payment was processed.",
    })),
  );

  return expiredReservations.length;
}
