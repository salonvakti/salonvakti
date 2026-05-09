import { addMinutes } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import type { TenantRow } from "@/lib/db-types";
import { BOOKING_TIMEZONE, istanbulWallClockToUtc } from "@/lib/booking/istanbul-time";
import { getTenantBookingSettings } from "@/lib/tenant/booking-settings";

export function validateBookingWallSlot(input: {
  dateStr: string;
  slotHHmm: string;
  durationMinutes: number;
  tenant: Pick<TenantRow, "settings_json">;
}): { ok: true; start: Date; end: Date } | { ok: false; error: string } {
  const duration = input.durationMinutes;
  if (!Number.isFinite(duration) || duration <= 0) {
    return { ok: false, error: "Geçersiz hizmet süresi." };
  }

  const settings = getTenantBookingSettings(input.tenant);

  const dayProbe = istanbulWallClockToUtc(input.dateStr, "12:00");
  if (!Number.isFinite(dayProbe.getTime())) {
    return { ok: false, error: "Geçersiz tarih." };
  }

  const isoDow = Number(formatInTimeZone(dayProbe, BOOKING_TIMEZONE, "i"));
  const jsDow = isoDow === 7 ? 0 : isoDow;
  if (settings.closedWeekdays.includes(jsDow)) {
    return { ok: false, error: "Bu gün için online randevu kapalı." };
  }

  const start = istanbulWallClockToUtc(input.dateStr, input.slotHHmm);
  const end = addMinutes(start, duration);

  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
    return { ok: false, error: "Geçersiz saat." };
  }

  const open = istanbulWallClockToUtc(input.dateStr, settings.openHHmm);
  const close = istanbulWallClockToUtc(input.dateStr, settings.closeHHmm);

  if (start < open || end > close) {
    return { ok: false, error: "Seçilen saat çalışma saatleri dışında." };
  }

  return { ok: true, start, end };
}
