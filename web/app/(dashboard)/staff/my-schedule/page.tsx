"use client";

import { useEffect, useState } from "react";
import { AppointmentCalendar } from "@/components/calendar/AppointmentCalendar";
import { useSupabaseContext } from "@/components/providers/supabase-provider";
import type { AppointmentSummary } from "@/types/appointment";
import {
  APPOINTMENT_SUMMARY_SELECT,
  mapAppointmentSummaryRow,
} from "@/lib/appointments/map-summary";

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

export default function StaffMySchedulePage() {
  const { client, profile, session } = useSupabaseContext();
  const [resolvedStaffId, setResolvedStaffId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<AppointmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function resolveStaff() {
      if (!client || !profile?.tenantId) {
        if (active) setResolvedStaffId(null);
        return;
      }
      if (profile.role !== "business_user") {
        if (active) setResolvedStaffId(null);
        return;
      }
      if (profile.staffId) {
        if (active) setResolvedStaffId(profile.staffId);
        return;
      }
      const uid = session?.user?.id;
      if (!uid) {
        if (active) setResolvedStaffId(null);
        return;
      }
      const { data } = await client
        .from("staff")
        .select("id")
        .eq("tenant_id", profile.tenantId)
        .eq("user_id", uid)
        .maybeSingle();
      if (active) setResolvedStaffId((data?.id as string | undefined) ?? null);
    }

    void resolveStaff();
    return () => {
      active = false;
    };
  }, [client, profile?.tenantId, profile?.role, profile?.staffId, session?.user?.id]);

  useEffect(() => {
    let active = true;

    async function load() {
      setError(null);
      if (!client || !profile?.tenantId || !resolvedStaffId) {
        if (active) {
          setLoading(false);
          setAppointments([]);
        }
        return;
      }

      const { data, error: fetchError } = await client
        .from("appointments")
        .select(APPOINTMENT_SUMMARY_SELECT)
        .eq("tenant_id", profile.tenantId)
        .eq("staff_id", resolvedStaffId)
        .order("start_time", { ascending: true });

      if (!active) return;

      if (fetchError) {
        setError(`Randevular yüklenemedi: ${fetchError.message}`);
        setAppointments([]);
      } else {
        const mapped: AppointmentSummary[] = (data ?? []).map((item) =>
          mapAppointmentSummaryRow(item as Record<string, unknown>)
        );
        setAppointments(sortAppointmentsByUpcoming(mapped));
      }
      setLoading(false);
    }

    void load();
    return () => {
      active = false;
    };
  }, [client, profile?.tenantId, resolvedStaffId]);

  if (profile?.role !== "business_user") {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Takvimim</h1>
        <p className="text-sm text-muted-foreground">Bu sayfa işletme personeli hesapları içindir.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Takvimim</h1>
        <p className="text-muted-foreground">Size atanmış randevular.</p>
      </div>
      {!resolvedStaffId ? (
        <p className="text-sm text-destructive">
          Personel kaydı bulunamadı. İşletme yöneticinizin sizi personel listesine eklediğinden ve hesabınızın
          bağlandığından emin olun.
        </p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Yükleniyor...</p> : null}
      <AppointmentCalendar items={appointments} title="Randevularım" />
    </div>
  );
}
