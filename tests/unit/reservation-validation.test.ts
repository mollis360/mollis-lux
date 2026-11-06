import { describe, expect, it } from "vitest";

import { isReservationHoldActive, RESERVATION_HOLD_MINUTES } from "../../src/lib/reservations/hold";
import { reservationRequestSchema } from "../../src/lib/reservations/validation";

describe("reservation request safeguards", () => {
  it("requires a sufficiently unique idempotency key", () => {
    expect(() => reservationRequestSchema.parse({
      roomCategoryId: "00000000-0000-0000-0000-000000000000",
      checkIn: "2099-10-10",
      checkOut: "2099-10-11",
      adults: 1,
      children: 0,
      guestName: "Test Guest",
      idempotencyKey: "short",
    })).toThrow();
  });

  it("treats the server expiration timestamp as authoritative", () => {
    const now = new Date("2099-10-10T12:00:00.000Z");
    const expiresAt = new Date(now.getTime() + RESERVATION_HOLD_MINUTES * 60 * 1000);
    expect(isReservationHoldActive("pending", expiresAt, now)).toBe(true);
    expect(isReservationHoldActive("pending", expiresAt, new Date(expiresAt.getTime() + 1))).toBe(false);
    expect(isReservationHoldActive("confirmed", expiresAt, now)).toBe(false);
  });
});
