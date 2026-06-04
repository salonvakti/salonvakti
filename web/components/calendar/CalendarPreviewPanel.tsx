"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppointmentSummary } from "@/types/appointment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  appointmentBlockStyle,
  buildDayStats,
  formatMonthTitle,
  formatSelectedDayTitle,
  formatTimeLabel,
  getDayScheduleBounds,
  getMonthGridDays,
  groupAppointmentsByDay,
  isInVisibleMonth,
  isToday,
  parseDateKey,
  shiftMonth,
  toDateKey,
} from "@/components/calendar/calendar-preview-utils";

const WEEKDAY_LABELS = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];

const statusLabel: Record<AppointmentSummary["status"], string> = {
  pending: "Beklemede",
  confirmed: "Onaylı",
  cancelled_by_business: "İşletme iptal",
  cancelled_by_client: "Müşteri iptal",
  completed: "Tamamlandı",
};

function blockTone(status: AppointmentSummary["status"]): string {
  if (status === "confirmed") {
    return "border-emerald-500/50 bg-emerald-500/15 text-emerald-950 dark:text-emerald-100";
  }
  if (status === "pending") {
    return "border-amber-500/50 bg-amber-500/15 text-amber-950 dark:text-amber-100";
  }
  if (status === "completed") {
    return "border-sky-500/40 bg-sky-500/10 text-sky-950 dark:text-sky-100";
  }
  return "border-muted-foreground/30 bg-muted/50 text-muted-foreground";
}

type Props = {
  items: AppointmentSummary[];
};

export function CalendarPreviewPanel({ items }: Props) {
  const todayKey = toDateKey(new Date());
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [visibleMonth, setVisibleMonth] = useState(() => parseDateKey(todayKey));

  const byDay = useMemo(() => groupAppointmentsByDay(items), [items]);
  const dayStats = useMemo(() => buildDayStats(byDay), [byDay]);
  const monthDays = useMemo(() => getMonthGridDays(visibleMonth), [visibleMonth]);

  const selectedAppointments = byDay.get(selectedDate) ?? [];
  const selectedStats = dayStats.get(selectedDate);
  const { startHour, endHour } = getDayScheduleBounds(selectedAppointments);
  const hourLabels = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => startHour + i
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,340px)_1fr]">
      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="space-y-3 border-b bg-muted/30 pb-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarDays className="h-4 w-4" aria-hidden />
              </div>
              <div>
                <CardTitle className="text-base">Ay görünümü</CardTitle>
                <CardDescription className="text-xs">
                  Randevulu günler işaretli; güne tıklayın
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Önceki ay"
                onClick={() => setVisibleMonth((m) => shiftMonth(m, -1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Sonraki ay"
                onClick={() => setVisibleMonth((m) => shiftMonth(m, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-center text-sm font-semibold capitalize tracking-tight">
            {formatMonthTitle(visibleMonth)}
          </p>
        </CardHeader>
        <CardContent className="p-3 pt-2">
          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAY_LABELS.map((label) => (
              <div
                key={label}
                className="py-1 text-center text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground"
              >
                {label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((day) => {
              const key = toDateKey(day);
              const stats = dayStats.get(key);
              const inMonth = isInVisibleMonth(day, visibleMonth);
              const selected = key === selectedDate;
              const today = isToday(day);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedDate(key);
                    if (!isInVisibleMonth(day, visibleMonth)) {
                      setVisibleMonth(day);
                    }
                  }}
                  className={cn(
                    "relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition-colors",
                    "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    !inMonth && "text-muted-foreground/50",
                    inMonth && stats && "bg-primary/10 font-medium",
                    selected && "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
                    today && !selected && "ring-1 ring-primary/40"
                  )}
                >
                  <span>{day.getDate()}</span>
                  {stats ? (
                    <span
                      className={cn(
                        "mt-0.5 flex gap-0.5",
                        selected && "opacity-90"
                      )}
                      aria-hidden
                    >
                      {stats.pending > 0 ? (
                        <span
                          className={cn(
                            "h-1 w-1 rounded-full",
                            selected ? "bg-primary-foreground/80" : "bg-amber-500"
                          )}
                        />
                      ) : null}
                      {stats.confirmed > 0 ? (
                        <span
                          className={cn(
                            "h-1 w-1 rounded-full",
                            selected ? "bg-primary-foreground/60" : "bg-emerald-500"
                          )}
                        />
                      ) : null}
                      {stats.total > stats.pending + stats.confirmed ? (
                        <span
                          className={cn(
                            "h-1 w-1 rounded-full",
                            selected ? "bg-primary-foreground/40" : "bg-muted-foreground/60"
                          )}
                        />
                      ) : null}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 border-t pt-3 text-[0.7rem] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Bekleyen
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Onaylı
            </span>
            <Button
              type="button"
              variant="link"
              size="xs"
              className="h-auto p-0 text-[0.7rem]"
              onClick={() => {
                setSelectedDate(todayKey);
                setVisibleMonth(parseDateKey(todayKey));
              }}
            >
              Bugüne git
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="flex min-h-[420px] flex-col overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="border-b bg-muted/20 pb-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base capitalize">
                {formatSelectedDayTitle(selectedDate)}
              </CardTitle>
              <CardDescription>
                {selectedStats
                  ? `${selectedStats.total} randevu${selectedStats.pending > 0 ? ` · ${selectedStats.pending} onay bekliyor` : ""}`
                  : "Bu gün için randevu yok"}
              </CardDescription>
            </div>
            {selectedStats ? (
              <Badge variant="secondary" className="shrink-0">
                {selectedStats.total} kayıt
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col p-0">
          {selectedAppointments.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
              <CalendarDays className="h-10 w-10 opacity-30" aria-hidden />
              <p className="text-sm">Seçilen günde randevu bulunmuyor.</p>
              <p className="text-xs">Başka bir güne tıklayarak takvimde gezinin.</p>
            </div>
          ) : (
            <ScrollArea className="h-[min(52vh,520px)]">
              <div className="grid grid-cols-[3.25rem_1fr] gap-0 p-4">
                <div className="relative text-[0.65rem] text-muted-foreground">
                  {hourLabels.map((hour, index) => (
                    <div
                      key={hour}
                      className="absolute right-1 -translate-y-1/2 tabular-nums"
                      style={{
                        top: `${(index / (hourLabels.length - 1 || 1)) * 100}%`,
                      }}
                    >
                      {String(hour).padStart(2, "0")}:00
                    </div>
                  ))}
                </div>
                <div
                  className="relative rounded-xl border bg-gradient-to-b from-muted/20 to-background"
                  style={{ minHeight: `${Math.max(280, (endHour - startHour) * 48)}px` }}
                >
                  {hourLabels.map((hour, index) => (
                    <div
                      key={`line-${hour}`}
                      className="pointer-events-none absolute inset-x-0 border-t border-dashed border-border/70 first:border-t-0"
                      style={{
                        top: `${(index / (hourLabels.length - 1 || 1)) * 100}%`,
                      }}
                    />
                  ))}
                  {selectedAppointments.map((item) => {
                    const { topPercent, heightPercent } = appointmentBlockStyle(
                      item,
                      startHour,
                      endHour
                    );
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "absolute inset-x-2 z-[1] overflow-hidden rounded-md border px-2 py-1.5 text-xs shadow-sm",
                          blockTone(item.status)
                        )}
                        style={{
                          top: `${topPercent}%`,
                          height: `${heightPercent}%`,
                          minHeight: "2.75rem",
                        }}
                      >
                        <p className="truncate font-semibold leading-tight">
                          {formatTimeLabel(item.startTime)} – {item.clientName}
                        </p>
                        <p className="truncate text-[0.65rem] opacity-90">
                          {item.serviceName}
                          {item.staffName ? ` · ${item.staffName}` : ""}
                        </p>
                        <Badge
                          variant="outline"
                          className="mt-1 h-4 border-transparent bg-background/40 px-1 text-[0.6rem]"
                        >
                          {statusLabel[item.status]}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
