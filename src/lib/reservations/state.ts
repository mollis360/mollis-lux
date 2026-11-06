
import type { ReservationStatus } from "@/src/db/schema/reservations";

const transitions: Record<
  ReservationStatus,
  readonly ReservationStatus[]
> = {
  pending: ["held", "confirmed", "expired", "cancelled"],
  held: ["confirmed", "expired", "cancelled"],
  confirmed: ["checked_in", "cancelled", "no_show"],
  cancelled: [],
  expired: [],
  checked_in: ["checked_out"],
  checked_out: [],
  no_show: [],
};

export function canTransitionReservation(
  from: ReservationStatus,
  to: ReservationStatus,
): boolean {
  return transitions[from].includes(to);
}

export function getReservationTransitions(
  status: ReservationStatus,
): ReservationStatus[] {
  return [...transitions[status]];
}
