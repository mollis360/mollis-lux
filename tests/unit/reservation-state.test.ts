import { describe, expect, it } from "vitest";

import { canTransitionReservation, getReservationTransitions } from "../../src/lib/reservations/state";

describe("reservation state transitions", () => {
  it("allows pending holds to expire", () => {
    expect(canTransitionReservation("pending", "expired")).toBe(true);
    expect(canTransitionReservation("expired", "confirmed")).toBe(false);
  });

  it("does not permit reopening terminal states", () => {
    expect(getReservationTransitions("cancelled")).toEqual([]);
    expect(getReservationTransitions("checked_out")).toEqual([]);
  });
});
