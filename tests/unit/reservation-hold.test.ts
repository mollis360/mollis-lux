import { describe, expect, it } from "vitest";

import {
  getReservationHoldExpiration,
  isReservationHoldActive,
  RESERVATION_HOLD_MINUTES,
} from "../../src/lib/reservations/hold";

describe("reservation holds", () => {
  const now = new Date("2026-10-09T12:00:00.000Z");

  it("sets reservation holds to 15 minutes", () => {
    expect(RESERVATION_HOLD_MINUTES).toBe(15);

    expect(getReservationHoldExpiration(now)).toEqual(
      new Date("2026-10-09T12:15:00.000Z"),
    );
  });

  it("recognizes an unexpired pending hold", () => {
    expect(
      isReservationHoldActive(
        "pending",
        new Date("2026-10-09T12:10:00.000Z"),
        now,
      ),
    ).toBe(true);
  });

  it("recognizes an unexpired held reservation", () => {
    expect(
      isReservationHoldActive(
        "held",
        new Date("2026-10-09T12:10:00.000Z"),
        now,
      ),
    ).toBe(true);
  });

  it("treats a hold expiring exactly now as inactive", () => {
    expect(isReservationHoldActive("pending", now, now)).toBe(false);
  });

  it("treats an expired hold as inactive", () => {
    expect(
      isReservationHoldActive(
        "held",
        new Date("2026-10-09T11:59:00.000Z"),
        now,
      ),
    ).toBe(false);
  });

  it("treats a missing expiration time as inactive", () => {
    expect(isReservationHoldActive("pending", null, now)).toBe(false);
  });

  it("does not treat confirmed reservations as active holds", () => {
    expect(
      isReservationHoldActive(
        "confirmed",
        new Date("2026-10-09T12:10:00.000Z"),
        now,
      ),
    ).toBe(false);
  });
});