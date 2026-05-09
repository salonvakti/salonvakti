"use client";

import { useEffect, useMemo, useState } from "react";
import { AppointmentCalendar } from "@/components/calendar/AppointmentCalendar";
import { Button } from "@/components/ui/button";
import { useSupabaseContext } from "@/components/providers/supabase-provider";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AppointmentSummary } from "@/types/appointment";
import type { AppointmentStatus } from "@/lib/db-types";

const statusLabel: Record<AppointmentStatus, string> = {
  pending: "Beklemede",
  confirmed: "Onaylı",
  cancelled_by_business: "İşletme reddetti",
  cancelled_by_client: "Müşteri iptal etti",
  completed: "Tamamlandı",
};

function getStatusBadgeClass(status: AppointmentStatus): string {
  if (status === "confirmed") {
    return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
  }
  if (status === "pending") {
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
  }
  if (status === "cancelled_by_business") {
    return "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300";
  }
  return "";
}

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

type StaffOption = { id: string; display_name: string };

export default function AdminAppointmentsPage() {
  const { client, profile } = useSupabaseContext();
  const [appointments, setAppointments] = useState<AppointmentSummary[]>([]);
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);
  const [filterStaffId, setFilterStaffId] = useState<string>("all");
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

      const [apRes, stRes] = await Promise.all([
        client
          .from("appointments")
          .select(
            "id,tenant_id,staff_id,start_time,end_time,status,clients(name),services(name),staff(display_name)"
          )
          .eq("tenant_id", profile.tenantId)
          .order("start_time", { ascending: true }),
        client
          .from("staff")
          .select("id,display_name")
          .eq("tenant_id", profile.tenantId)
          .order("display_name", { ascending: true }),
      ]);

      if (!active) return;

      if (stRes.error) {
        setStaffOptions([]);
      } else {
        setStaffOptions((stRes.data ?? []) as StaffOption[]);
      }

      if (apRes.error) {
        setError(`Randevular yüklenemedi: ${apRes.error.message}`);
        setAppointments([]);
      } else {
        const mapped: AppointmentSummary[] = (apRes.data ?? []).map((item) => ({
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

  async function updateAppointmentStatus(appointmentId: string, status: AppointmentStatus) {
    setError(null);
    setMessage(null);

    if (!client || !profile?.tenantId) {
      setError("İşletme kaydı bulunamadı.");
      return;
    }

    setUpdatingId(appointmentId);
    const { error: updateError } = await client
      .from("appointments")
      .update({ status })
      .eq("id", appointmentId)
      .eq("tenant_id", profile.tenantId);

    if (updateError) {
      setError(`Randevu durumu güncellenemedi: ${updateError.message}`);
      setUpdatingId(null);
      return;
    }

    setAppointments((prev) =>
      prev.map((item) => (item.id === appointmentId ? { ...item, status } : item))
    );
    setMessage(status === "confirmed" ? "Randevu onaylandı." : "Randevu reddedildi.");
    setUpdatingId(null);
  }

  const visibleAppointments = useMemo(() => {
    let list = showPendingOnly
      ? appointments.filter((item) => item.status === "pending")
      : appointments;
    if (filterStaffId !== "all") {
      list = list.filter((item) => item.staffId === filterStaffId);
    }
    return list;
  }, [appointments, showPendingOnly, filterStaffId]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Randevular</h1>
          <p className="text-muted-foreground">Bekleyen istekleri onaylayın veya reddedin.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => setShowPendingOnly((prev) => !prev)}
          >
            {showPendingOnly ? "Filtre: Sadece Bekleyen" : "Filtre: Tümü"}
          </Button>
          <div className="flex items-center gap-2">
            <label htmlFor="staff-filter" className="text-sm text-muted-foreground whitespace-nowrap">
              Personel
            </label>
            <select
              id="staff-filter"
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
              value={filterStaffId}
              onChange={(e) => setFilterStaffId(e.target.value)}
            >
              <option value="all">Tümü</option>
              {staffOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.display_name}
                </option>
              ))}
            </select>
          </div>
          <Button type="button" variant="outline" disabled>
            Yeni randevu
          </Button>
        </div>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Randevular yükleniyor...</p> : null}
      <AppointmentCalendar items={visibleAppointments} />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Müşteri</TableHead>
              <TableHead>Hizmet</TableHead>
              <TableHead>Personel</TableHead>
              <TableHead>Zaman</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleAppointments.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.clientName}</TableCell>
                <TableCell>{a.serviceName}</TableCell>
                <TableCell>{a.staffName ?? "—"}</TableCell>
                <TableCell>{new Date(a.startTime).toLocaleString("tr-TR")}</TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeClass(a.status)}>{statusLabel[a.status]}</Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => void updateAppointmentStatus(a.id, "confirmed")}
                    disabled={updatingId === a.id || a.status === "confirmed" || a.status === "completed"}
                  >
                    Onayla
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void updateAppointmentStatus(a.id, "cancelled_by_business")}
                    disabled={
                      updatingId === a.id ||
                      a.status === "cancelled_by_business" ||
                      a.status === "completed"
                    }
                  >
                    Reddet
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!loading && visibleAppointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                  Görüntülenecek randevu yok.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
