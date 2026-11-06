import { describe, expect, it } from "vitest";

import { isDateOnly, isValidStayRange, nightsBetween, toDateRangeLiteral } from "../../src/lib/availability/date-utils";
import { availabilityRequestSchema } from "../../src/lib/availability/validation";

describe("availability date semantics", () => {
  it("uses an inclusive check-in and exclusive check-out", () => {
    expect(nightsBetween("2026-10-10", "2026-10-14")).toBe(4);
    expect(toDateRangeLiteral("2026-10-10", "2026-10-14")).toBe("[2026-10-10,2026-10-14)");
  });

  it("rejects invalid and backwards date ranges", () => {
    expect(isDateOnly("2026-02-29")).toBe(false);
    expect(isValidStayRange("2026-10-14", "2026-10-10")).toBe(false);
    expect(() => availabilityRequestSchema.parse({ roomCategoryId: "not-a-uuid", checkIn: "2026-10-14", checkOut: "2026-10-10", adults: 1, children: 0 })).toThrow();
  });

  it("enforces guest counts at the request boundary", () => {
    expect(() => availabilityRequestSchema.parse({ roomCategoryId: "00000000-0000-0000-0000-000000000000", checkIn: "2026-10-10", checkOut: "2026-10-14", adults: 0, children: 0 })).toThrow();
    expect(availabilityRequestSchema.parse({ roomCategoryId: "00000000-0000-0000-0000-000000000000", checkIn: "2026-10-10", checkOut: "2026-10-14", adults: 2, children: 1 })).toMatchObject({ adults: 2, children: 1 });
  });
});
