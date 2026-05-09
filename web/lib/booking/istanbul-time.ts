import { addDays, format, parse } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

/** Randevu saatleri Türkiye yerel saati ile hesaplanır. */
export const BOOKING_TIMEZONE = "Europe/Istanbul";

/**
 * `YYYY-MM-DD` + `HH:mm` (İstanbul duvar saati) → gerçek UTC anı.
 */
export function istanbulWallClockToUtc(dateStr: string, hhmm: string): Date {
  const [hRaw, mRaw] = hhmm.split(":");
  const h = (hRaw ?? "0").padStart(2, "0");
  const m = (mRaw ?? "0").padStart(2, "0");
  const wall = `${dateStr} ${h}:${m}:00`;
  return fromZonedTime(wall, BOOKING_TIMEZONE);
}

export function nextDateStrYmd(dateStr: string): string {
  const base = parse(dateStr, "yyyy-MM-dd", new Date());
  return format(addDays(base, 1), "yyyy-MM-dd");
}
