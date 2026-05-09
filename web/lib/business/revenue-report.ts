import { addMonths } from "date-fns";
import { formatInTimeZone, toDate } from "date-fns-tz";

export const REPORT_TIMEZONE = "Europe/Istanbul";

export function defaultReportSelection(): { monthKey: string; reportDayKey: string } {
  const monthKey = formatInTimeZone(new Date(), REPORT_TIMEZONE, "yyyy-MM");
  const today = formatInTimeZone(new Date(), REPORT_TIMEZONE, "yyyy-MM-dd");
  const reportDayKey = today.startsWith(monthKey) ? today : `${monthKey}-01`;
  return { monthKey, reportDayKey };
}

/** Panelden onaylanmış veya hizmeti tamamlanmış sayılır; iptaller dahil değil. */
export const REALIZED_APPOINTMENT_STATUSES = ["confirmed", "completed"] as const;

export type RevenueAppointmentRow = {
  id: string;
  start_time: string;
  staff_id: string | null;
  status: string;
  price: number;
  staff_display_name: string | null;
};

export type DailyRevenueRow = {
  dayKey: string;
  dayLabel: string;
  count: number;
  revenue: number;
};

export type StaffRevenueRow = {
  staffId: string;
  staffName: string;
  count: number;
  revenue: number;
};

export type RevenueReportComputed = {
  monthKey: string;
  reportDayKey: string;
  realizedCountMonth: number;
  realizedRevenueMonth: number;
  dailyRows: DailyRevenueRow[];
  staffMonthly: StaffRevenueRow[];
  staffDaily: StaffRevenueRow[];
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Takvim ayındaki gün sayısı (yıl/ay). */
export function daysInMonth(year: number, month1to12: number): number {
  return new Date(year, month1to12, 0).getDate();
}

export function istanbulMonthBounds(monthKey: string): { startUtc: Date; endExclusiveUtc: Date } {
  const startUtc = toDate(`${monthKey}-01T00:00:00`, { timeZone: REPORT_TIMEZONE });
  const endExclusiveUtc = addMonths(startUtc, 1);
  return { startUtc, endExclusiveUtc };
}

function monthRowsInRange(
  rows: RevenueAppointmentRow[],
  monthKey: string
): RevenueAppointmentRow[] {
  const { startUtc, endExclusiveUtc } = istanbulMonthBounds(monthKey);
  const t0 = startUtc.getTime();
  const t1 = endExclusiveUtc.getTime();
  return rows.filter((r) => {
    if (!REALIZED_APPOINTMENT_STATUSES.includes(r.status as (typeof REALIZED_APPOINTMENT_STATUSES)[number])) {
      return false;
    }
    const t = new Date(r.start_time).getTime();
    if (t < t0 || t >= t1) return false;
    return formatInTimeZone(new Date(r.start_time), REPORT_TIMEZONE, "yyyy-MM") === monthKey;
  });
}

function rowsForDay(rows: RevenueAppointmentRow[], dayKey: string): RevenueAppointmentRow[] {
  return rows.filter(
    (r) =>
      REALIZED_APPOINTMENT_STATUSES.includes(r.status as (typeof REALIZED_APPOINTMENT_STATUSES)[number]) &&
      formatInTimeZone(new Date(r.start_time), REPORT_TIMEZONE, "yyyy-MM-dd") === dayKey
  );
}

function staffKeyAndName(r: RevenueAppointmentRow): { id: string; name: string } {
  if (!r.staff_id) {
    return { id: "__unassigned__", name: "Atanmamış personel" };
  }
  return {
    id: r.staff_id,
    name: r.staff_display_name?.trim() || "Personel",
  };
}

function aggregateByStaff(list: RevenueAppointmentRow[]): StaffRevenueRow[] {
  const map = new Map<string, { name: string; count: number; revenue: number }>();
  for (const r of list) {
    const { id, name } = staffKeyAndName(r);
    const cur = map.get(id) ?? { name, count: 0, revenue: 0 };
    cur.count += 1;
    cur.revenue += r.price;
    map.set(id, cur);
  }
  return Array.from(map.entries())
    .map(([staffId, v]) => ({
      staffId,
      staffName: v.name,
      count: v.count,
      revenue: Math.round(v.revenue * 100) / 100,
    }))
    .sort((a, b) => b.revenue - a.revenue || a.staffName.localeCompare(b.staffName, "tr"));
}

export function buildRevenueReport(
  rows: RevenueAppointmentRow[],
  monthKey: string,
  reportDayKey: string
): RevenueReportComputed {
  const [y, m] = monthKey.split("-").map(Number);
  const dim = daysInMonth(y, m);

  const inMonth = monthRowsInRange(rows, monthKey);
  const realizedRevenueMonth = Math.round(inMonth.reduce((s, r) => s + r.price, 0) * 100) / 100;

  const dailyMap = new Map<string, { count: number; revenue: number }>();
  for (const r of inMonth) {
    const dayKey = formatInTimeZone(new Date(r.start_time), REPORT_TIMEZONE, "yyyy-MM-dd");
    const cur = dailyMap.get(dayKey) ?? { count: 0, revenue: 0 };
    cur.count += 1;
    cur.revenue += r.price;
    dailyMap.set(dayKey, cur);
  }

  const dailyRows: DailyRevenueRow[] = [];
  for (let d = 1; d <= dim; d += 1) {
    const dayKey = `${monthKey}-${pad2(d)}`;
    const agg = dailyMap.get(dayKey) ?? { count: 0, revenue: 0 };
    const dayLabel = `${pad2(d)}.${pad2(m)}.${y}`;
    dailyRows.push({
      dayKey,
      dayLabel,
      count: agg.count,
      revenue: Math.round(agg.revenue * 100) / 100,
    });
  }

  const staffMonthly = aggregateByStaff(inMonth);

  const dayRows = rowsForDay(rows, reportDayKey);
  const staffDaily = aggregateByStaff(dayRows);

  return {
    monthKey,
    reportDayKey,
    realizedCountMonth: inMonth.length,
    realizedRevenueMonth,
    dailyRows,
    staffMonthly,
    staffDaily,
  };
}
