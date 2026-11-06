import { describe, expect, it } from "vitest";

import { centsToMoney, moneyToCents } from "../../src/lib/reservations/money";

describe("reservation pricing snapshots", () => {
  it("calculates cents without floating-point rounding", () => {
    expect(centsToMoney(moneyToCents("300.00") * BigInt(4))).toBe("1200.00");
    expect(centsToMoney(moneyToCents("99.99") * BigInt(3))).toBe("299.97");
  });
});
