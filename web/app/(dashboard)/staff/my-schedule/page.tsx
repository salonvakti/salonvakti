"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppointmentCalendar } from "@/components/calendar/AppointmentCalendar";
import { useSupabaseContext } from "@/components/providers/supabase-provider";
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
      if (profile.role === "business_admin") {
        if (active) setResolvedStaffId("__all__");
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

      let query = client
        .from("appointments")
        .select(
          "id,tenant_id,staff_id,start_time,end_time,status,clients(name),services(name),staff(display_name)"
        )
        .eq("tenant_id", profile.tenantId)
        .order("start_time", { ascending: true });

      if (resolvedStaffId !== "__all__") {
        query = query.eq("staff_id", resolvedStaffId);
      }

      const { data, error: fetchError } = await query;

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

    void load();
    return () => {
      active = false;
    };
  }, [client, profile?.tenantId, resolvedStaffId]);

  if (profile?.role !== "business_user" && profile?.role !== "business_admin") {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Takvimim</h1>
        <p className="text-sm text-muted-foreground">Bu sayfa işletme hesapları içindir.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Takvimim</h1>
        <p className="text-muted-foreground">
          {profile?.role === "business_admin"
            ? "İşletmenizdeki tüm randevuların özeti. Onay ve filtre için "
            : "Size atanmış randevular. "}
          {profile?.role === "business_admin" ? (
            <Link href="/admin/appointments" className="underline underline-offset-4">
              Randevular
            </Link>
          ) : null}
          {profile?.role === "business_admin" ? " sayfasını kullanın." : null}
        </p>
      </div>
      {profile?.role === "business_user" && !resolvedStaffId ? (
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
