 "use client";

import { useEffect, useMemo, useState } from "react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { AppointmentCalendar } from "@/components/calendar/AppointmentCalendar";
import { useSupabaseContext } from "@/components/providers/supabase-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AppointmentSummary } from "@/types/appointment";
import type { AppointmentStatus } from "@/lib/db-types";

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

export default function AdminDashboardPage() {
  const { client, profile } = useSupabaseContext();
  const [appointments, setAppointments] = useState<AppointmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(formatDateInputValue(new Date()));

  useEffect(() => {
    let active = true;

    async function loadAppointments() {
      setError(null);

      if (!client || !profile?.tenantId) {
        if (active) {
          setLoading(false);
          setError("İşletme bilgisi bulunamadı (tenant_id eksik).");
        }
        return;
      }

      const { data, error: fetchError } = await client
        .from("appointments")
        .select(
          "id,tenant_id,staff_id,start_time,end_time,status,clients(name),services(name),staff(display_name)"
        )
        .eq("tenant_id", profile.tenantId)
        .order("start_time", { ascending: true });

      if (!active) return;

      if (fetchError) {
        setError(`Randevular yüklenemedi: ${fetchError.message}`);
        setAppointments([]);
      } else {
        const mapped: AppointmentSummary[] = (data ?? []).map((item) => ({
          id: item.id as string,
          tenantId: item.tenant_id as string,
          clientName: (item.clients as { name?: string } | null)?.name ?? "Müşteri",
          serviceName: (item.services as { name?: string } | null)?.name ?? "Hizmet",
          staffName: (item.staff as { display_name?: string } | null)?.display_name ?? null,
          staffId: (item.staff_id as string | null) ?? null,
          startTime: item.start_time as string,
          endTime: item.end_time as string,
          status: item.status as AppointmentStatus,
        }));
        setAppointments(sortAppointmentsByUpcoming(mapped));
      }

      setLoading(false);
    }

    void loadAppointments();
    return () => {
      active = false;
    };
  }, [client, profile?.tenantId]);

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
      {loading ? <p className="text-sm text-muted-foreground">Dashboard verileri yükleniyor...</p> : null}
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
