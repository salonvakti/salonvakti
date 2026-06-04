import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { tr } from "date-fns/locale";
import type { AppointmentSummary } from "@/types/appointment";

export function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function parseDateKey(key: string): Date {
  return parseISO(`${key}T12:00:00`);
}

export function groupAppointmentsByDay(
  items: AppointmentSummary[]
): Map<string, AppointmentSummary[]> {
  const map = new Map<string, AppointmentSummary[]>();
  for (const item of items) {
    const key = toDateKey(new Date(item.startTime));
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  for (const list of Array.from(map.values())) {
    list.sort(
      (a: AppointmentSummary, b: AppointmentSummary) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }
  return map;
}

export type DayAppointmentStats = {
  total: number;
  pending: number;
  confirmed: number;
};

export function buildDayStats(
  byDay: Map<string, AppointmentSummary[]>
): Map<string, DayAppointmentStats> {
  const stats = new Map<string, DayAppointmentStats>();
  for (const [key, list] of Array.from(byDay.entries())) {
    stats.set(key, {
      total: list.length,
      pending: list.filter((a: AppointmentSummary) => a.status === "pending").length,
      confirmed: list.filter((a: AppointmentSummary) => a.status === "confirmed").length,
    });
  }
  return stats;
}

export function getMonthGridDays(visibleMonth: Date): Date[] {
  const monthStart = startOfMonth(visibleMonth);
  const monthEnd = endOfMonth(visibleMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

export function formatMonthTitle(date: Date): string {
  return format(date, "MMMM yyyy", { locale: tr });
}

export function formatSelectedDayTitle(key: string): string {
  return format(parseDateKey(key), "d MMMM yyyy, EEEE", { locale: tr });
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function isInVisibleMonth(day: Date, visibleMonth: Date): boolean {
  return isSameMonth(day, visibleMonth);
}

export function shiftMonth(visibleMonth: Date, delta: number): Date {
  return addMonths(visibleMonth, delta);
}

/** Gün görünümü için dakika aralığı (yerel saat) */
export function getDayScheduleBounds(items: AppointmentSummary[]): {
  startHour: number;
  endHour: number;
} {
  if (items.length === 0) {
    return { startHour: 8, endHour: 20 };
  }

  let minMinutes = 24 * 60;
  let maxMinutes = 0;

  for (const item of items) {
    const start = new Date(item.startTime);
    const end = new Date(item.endTime);
    const startM = start.getHours() * 60 + start.getMinutes();
    const endM = end.getHours() * 60 + end.getMinutes();
    minMinutes = Math.min(minMinutes, startM);
    maxMinutes = Math.max(maxMinutes, endM);
  }

  const startHour = Math.max(6, Math.floor(minMinutes / 60) - 1);
  const endHour = Math.min(23, Math.ceil(maxMinutes / 60) + 1);
  return { startHour, endHour: Math.max(startHour + 1, endHour) };
}

export function appointmentBlockStyle(
  item: AppointmentSummary,
  startHour: number,
  endHour: number
): { topPercent: number; heightPercent: number } {
  const start = new Date(item.startTime);
  const end = new Date(item.endTime);
  const rangeMinutes = (endHour - startHour) * 60;
  const startOffset = start.getHours() * 60 + start.getMinutes() - startHour * 60;
  const duration = Math.max(
    15,
    (end.getTime() - start.getTime()) / 60_000
  );

  const topPercent = (startOffset / rangeMinutes) * 100;
  const heightPercent = (duration / rangeMinutes) * 100;

  return {
    topPercent: Math.max(0, Math.min(92, topPercent)),
    heightPercent: Math.max(4, Math.min(100 - topPercent, heightPercent)),
  };
}

export function formatTimeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
