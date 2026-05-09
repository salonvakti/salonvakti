import type { TenantRow } from "@/lib/db-types";

export type TenantBookingSettings = {
  openHHmm: string;
  closeHHmm: string;
  slotStepMinutes: number;
  /** JavaScript getDay: 0=Pazar … 6=Cumartesi */
  closedWeekdays: number[];
};

const DEFAULTS: TenantBookingSettings = {
  openHHmm: "09:00",
  closeHHmm: "19:00",
  slotStepMinutes: 15,
  closedWeekdays: [],
};

function parseHHmmToMinutes(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min)) return null;
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

export function getTenantBookingSettings(
  tenant: Pick<TenantRow, "settings_json">
): TenantBookingSettings {
  const raw = tenant.settings_json as Record<string, unknown> | null | undefined;
  const booking = raw?.booking as Record<string, unknown> | undefined;
  if (!booking) return DEFAULTS;

  const open =
    typeof booking.open === "string" && booking.open.trim() ? booking.open.trim() : DEFAULTS.openHHmm;
  const close =
    typeof booking.close === "string" && booking.close.trim()
      ? booking.close.trim()
      : DEFAULTS.closeHHmm;
  const slotStep =
    typeof booking.slotStepMinutes === "number" && booking.slotStepMinutes > 0
      ? Math.floor(booking.slotStepMinutes)
      : DEFAULTS.slotStepMinutes;

  const closedRaw = booking.closedWeekdays;
  let closedWeekdays: number[] = DEFAULTS.closedWeekdays;
  if (Array.isArray(closedRaw)) {
    closedWeekdays = closedRaw
      .filter((x): x is number => typeof x === "number" && x >= 0 && x <= 6)
      .filter((x, i, a) => a.indexOf(x) === i);
  }

  const oMin = parseHHmmToMinutes(open);
  const cMin = parseHHmmToMinutes(close);
  if (oMin === null || cMin === null || cMin <= oMin) {
    return DEFAULTS;
  }

  return {
    openHHmm: open,
    closeHHmm: close,
    slotStepMinutes: slotStep,
    closedWeekdays,
  };
}
