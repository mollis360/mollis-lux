
export const RESERVATION_HOLD_MINUTES = 15;

export function getReservationHoldExpiration(now = new Date()) {
  return new Date(
    now.getTime() + RESERVATION_HOLD_MINUTES * 60 * 1000,
  );
}

export function isReservationHoldActive(
  status: string,
  expiresAt: Date | null,
  now = new Date(),
) {
  return (
    ["pending", "held"].includes(status) &&
    expiresAt !== null &&
    expiresAt > now
  );
}
