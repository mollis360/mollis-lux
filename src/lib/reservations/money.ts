export function moneyToCents(value: string) {
  const match = value.match(/^(\d+)(?:\.(\d{1,2}))?$/);
  if (!match) throw new Error("Invalid monetary value.");
  return BigInt(match[1]) * BigInt(100) + BigInt((match[2] ?? "").padEnd(2, "0"));
}

export function centsToMoney(value: bigint) {
  const whole = value / BigInt(100);
  const cents = (value % BigInt(100)).toString().padStart(2, "0");
  return `${whole}.${cents}`;
}
