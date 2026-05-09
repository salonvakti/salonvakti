"use server";

import {
  buildRevenueReport,
  istanbulMonthBounds,
  REALIZED_APPOINTMENT_STATUSES,
  type RevenueAppointmentRow,
  type RevenueReportComputed,
} from "@/lib/business/revenue-report";
import { getSessionProfile } from "@/lib/auth/session";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function isYearMonth(s: string): boolean {
  return /^\d{4}-\d{2}$/.test(s);
}

function isYearMonthDay(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export async function loadRevenueReportAction(input: {
  monthKey: string;
  reportDayKey: string;
}): Promise<{ report: RevenueReportComputed | null; error: string | null }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { report: null, error: "Oturum yapılandırması eksik." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { report: null, error: "Oturum yok." };
  }

  const profile = getSessionProfile(user);
  if (profile?.role !== "business_admin" || !profile.tenantId) {
    return { report: null, error: "Bu rapor yalnızca işletme yöneticisi içindir." };
  }

  if (!isYearMonth(input.monthKey) || !isYearMonthDay(input.reportDayKey)) {
    return { report: null, error: "Geçersiz tarih seçimi." };
  }

  let reportDayKey = input.reportDayKey;
  if (!reportDayKey.startsWith(input.monthKey)) {
    reportDayKey = `${input.monthKey}-01`;
  }

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return {
      report: null,
      error: "Sunucu yapılandırması eksik: SUPABASE_SERVICE_ROLE_KEY gerekli.",
    };
  }

  const { startUtc, endExclusiveUtc } = istanbulMonthBounds(input.monthKey);

  const { data, error } = await admin
    .from("appointments")
    .select(
      `
      id,
      start_time,
      staff_id,
      status,
      price_snapshot,
      services ( price ),
      staff ( display_name )
    `
    )
    .eq("tenant_id", profile.tenantId)
    .in("status", [...REALIZED_APPOINTMENT_STATUSES])
    .gte("start_time", startUtc.toISOString())
    .lt("start_time", endExclusiveUtc.toISOString());

  if (error) {
    return { report: null, error: error.message };
  }

  const mapped: RevenueAppointmentRow[] = (data ?? []).map((row: Record<string, unknown>) => {
    const services = row.services as { price?: unknown } | null;
    const staff = row.staff as { display_name?: unknown } | null;

    const snapshotRaw = row.price_snapshot;
    const fallbackRaw = services?.price;

    function toMoney(v: unknown): number | null {
      if (typeof v === "number" && Number.isFinite(v)) return v;
      if (typeof v === "string" && v.trim() !== "") {
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
      }
      return null;
    }

    const snapshot = toMoney(snapshotRaw);
    const fallback = toMoney(fallbackRaw);
    const price = snapshot ?? fallback ?? 0;

    return {
      id: row.id as string,
      start_time: row.start_time as string,
      staff_id: (row.staff_id as string | null) ?? null,
      status: row.status as string,
      price,
      staff_display_name:
        typeof staff?.display_name === "string" ? staff.display_name : null,
    };
  });

  const report = buildRevenueReport(mapped, input.monthKey, reportDayKey);
  return { report, error: null };
}
