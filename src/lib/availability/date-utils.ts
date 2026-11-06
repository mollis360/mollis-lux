
export function isDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function isValidStayRange(
  checkIn: string,
  checkOut: string,
) {
  return (
    isDateOnly(checkIn) &&
    isDateOnly(checkOut) &&
    checkIn < checkOut
  );
}

export function nightsBetween(
  checkIn: string,
  checkOut: string,
) {
  if (!isValidStayRange(checkIn, checkOut)) {
    return 0;
  }

  const [inYear, inMonth, inDay] = checkIn.split("-").map(Number);
  const [outYear, outMonth, outDay] = checkOut.split("-").map(Number);

  const start = Date.UTC(inYear, inMonth - 1, inDay);
  const end = Date.UTC(outYear, outMonth - 1, outDay);

  return Math.round((end - start) / 86_400_000);
}

export function toDateRangeLiteral(
  checkIn: string,
  checkOut: string,
) {
  return `[${checkIn},${checkOut})`;
}

export function todayInTimeZone(
  timeZone: string,
  now = new Date(),
) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const values = new Map(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.get("year")}-${values.get("month")}-${values.get("day")}`;
}
