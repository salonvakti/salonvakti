import "server-only";

import { addMinutes } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { BOOKING_TIMEZONE, istanbulWallClockToUtc, nextDateStrYmd } from "@/lib/booking/istanbul-time";
import { getTenantBookingSettings } from "@/lib/tenant/booking-settings";

const BLOCKING_STATUSES = ["pending", "confirmed", "completed"] as const;

function intervalsOverlap(a0: Date, a1: Date, b0: Date, b1: Date): boolean {
  return a0.getTime() < b1.getTime() && a1.getTime() > b0.getTime();
}

/**
 * Personel + tarih için müsait `HH:mm` slotları (İstanbul duvar saati etiketi).
 */
export async function listAvailableBookingSlots(input: {
  tenantId: string;
  staffId: string;
  dateStr: string;
  durationMinutes: number;
  settingsSource: { settings_json?: Record<string, unknown> | null };
}): Promise<{ slots: string[]; error: string | null }> {
  const duration = input.durationMinutes;
  if (!Number.isFinite(duration) || duration <= 0) {
    return { slots: [], error: "Geçersiz hizmet süresi." };
  }

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return { slots: [], error: null };
  }

  const settings = getTenantBookingSettings({
    settings_json: input.settingsSource.settings_json as never,
  });

  const dayProbe = istanbulWallClockToUtc(input.dateStr, "12:00");
  if (!Number.isFinite(dayProbe.getTime())) {
    return { slots: [], error: "Geçersiz tarih." };
  }

  const isoDow = Number(formatInTimeZone(dayProbe, BOOKING_TIMEZONE, "i"));
  const jsDow = isoDow === 7 ? 0 : isoDow;
  if (settings.closedWeekdays.includes(jsDow)) {
    return { slots: [], error: null };
  }

  const dayStartUtc = istanbulWallClockToUtc(input.dateStr, "00:00");
  const nextDay = nextDateStrYmd(input.dateStr);
  const dayEndUtc = istanbulWallClockToUtc(nextDay, "00:00");

  const openUtc = istanbulWallClockToUtc(input.dateStr, settings.openHHmm);
  const closeUtc = istanbulWallClockToUtc(input.dateStr, settings.closeHHmm);

  const { data: appts, error: apErr } = await admin
    .from("appointments")
    .select("start_time,end_time,status")
    .eq("tenant_id", input.tenantId)
    .eq("staff_id", input.staffId)
    .lt("start_time", dayEndUtc.toISOString())
    .gt("end_time", dayStartUtc.toISOString());

  if (apErr) {
    return { slots: [], error: apErr.message };
  }

  const blocks = (appts ?? [])
    .filter((a) => BLOCKING_STATUSES.includes(a.status as (typeof BLOCKING_STATUSES)[number]))
    .map((a) => ({
      start: new Date(a.start_time as string),
      end: new Date(a.end_time as string),
    }))
    .filter((b) => Number.isFinite(b.start.getTime()) && Number.isFinite(b.end.getTime()));

  const slots: string[] = [];
  const step = settings.slotStepMinutes;

  let cursor = openUtc;
  const maxIterations = 200;
  let iter = 0;

  while (cursor < closeUtc && iter < maxIterations) {
    iter += 1;
    const slotStart = cursor;
    const slotEnd = addMinutes(slotStart, duration);

    if (slotEnd > closeUtc) {
      break;
    }

    const clashes = blocks.some((b) =>
      intervalsOverlap(slotStart, slotEnd, b.start, b.end)
    );

    if (!clashes) {
      slots.push(formatInTimeZone(slotStart, BOOKING_TIMEZONE, "HH:mm"));
    }

    cursor = addMinutes(cursor, step);
  }

  return { slots, error: null };
}

/** Yeni randevu eklenmeden önce personel çakışması kontrolü (iptaller hariç). */
export async function hasStaffBookingConflict(input: {
  tenantId: string;
  staffId: string;
  start: Date;
  end: Date;
}): Promise<{ conflict: boolean; error: string | null }> {
  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return { conflict: true, error: "Sunucu yapılandırması eksik." };
  }

  const { data, error } = await admin
    .from("appointments")
    .select("id")
    .eq("tenant_id", input.tenantId)
    .eq("staff_id", input.staffId)
    .in("status", [...BLOCKING_STATUSES])
    .lt("start_time", input.end.toISOString())
    .gt("end_time", input.start.toISOString())
    .limit(1)
    .maybeSingle();

  if (error) {
    return { conflict: true, error: error.message };
  }

  return { conflict: Boolean(data), error: null };
}
