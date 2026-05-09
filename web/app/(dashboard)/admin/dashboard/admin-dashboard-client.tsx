"use client";

import { useEffect, useMemo, useState } from "react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { AppointmentCalendar } from "@/components/calendar/AppointmentCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AppointmentSummary } from "@/types/appointment";

function sortAppointmentsByUpcoming(items: AppointmentSummary[]): AppointmentSummary[] {
  const now = Date.now();
  return [...items].sort((a, b) => {
    const aTime = new Date(a.startTime).getTime();
    const bTime = new Date(b.startTime).getTime();
    const aFuture = aTime >= now;
    const bFuture = bTime >= now;
    if (aFuture && bFuture) return aTime - bTime;
    if (aFuture && !bFuture) return -1;
    if (!aFuture && bFuture) return 1;
    return bTime - aTime;
  });
}

function formatDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function AdminDashboardClient({
  initialAppointments,
  initialListError,
}: {
  initialAppointments: AppointmentSummary[];
  initialListError: string | null;
}) {
  const [appointments, setAppointments] = useState(() =>
    sortAppointmentsByUpcoming(initialAppointments)
  );
  const [error, setError] = useState<string | null>(initialListError);
  const [selectedDate, setSelectedDate] = useState<string>(formatDateInputValue(new Date()));

  useEffect(() => {
    setAppointments(sortAppointmentsByUpcoming(initialAppointments));
    setError(initialListError);
  }, [initialAppointments, initialListError]);

  const todayKey = formatDateInputValue(new Date());
  const todayPendingCount = appointments.filter((item) => {
    const key = formatDateInputValue(new Date(item.startTime));
    return key === todayKey && item.status === "pending";
  }).length;
  const activeClientCount = new Set(appointments.map((item) => item.clientName)).size;

  const selectedDayAppointments = useMemo(() => {
    return appointments.filter((item) => formatDateInputValue(new Date(item.startTime)) === selectedDate);
  }, [appointments, selectedDate]);

  const upcomingAppointments = useMemo(() => {
    const now = Date.now();
    return appointments.filter((item) => new Date(item.startTime).getTime() >= now);
  }, [appointments]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">İşletme özeti</h1>
        <p className="text-muted-foreground">Bugünün randevuları ve hızlı metrikler.</p>
      </div>
      <StatsCards
        stats={[
          { label: "Bugün bekleyen randevu", value: String(todayPendingCount), hint: "Onay gerektirir" },
          { label: "Aktif müşteri", value: String(activeClientCount) },
          { label: "Yaklaşan randevu", value: String(upcomingAppointments.length) },
        ]}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Liste</TabsTrigger>
          <TabsTrigger value="calendar">Takvim önizleme</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <AppointmentCalendar items={upcomingAppointments} title="Yaklaşan randevular" />
        </TabsContent>
        <TabsContent value="calendar">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="preview-date" className="text-sm font-medium">
                Önizleme tarihi
              </label>
              <input
                id="preview-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-8 rounded-md border px-2 text-sm"
              />
            </div>
            <AppointmentCalendar items={selectedDayAppointments} title="Seçilen gün randevuları" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
