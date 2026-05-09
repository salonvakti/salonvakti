"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AppointmentCalendar } from "@/components/calendar/AppointmentCalendar";
import { Button } from "@/components/ui/button";
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
import {
  listAppointmentsForTenantAdminAction,
  updateAppointmentStatusAdminAction,
} from "./actions";

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

export function AdminAppointmentsClient({
  initialAppointments,
  initialStaffOptions,
  initialListError,
}: {
  initialAppointments: AppointmentSummary[];
  initialStaffOptions: StaffOption[];
  initialListError: string | null;
}) {
  const router = useRouter();
  const [appointments, setAppointments] = useState(() =>
    sortAppointmentsByUpcoming(initialAppointments)
  );
  const [staffOptions, setStaffOptions] = useState(initialStaffOptions);
  const [filterStaffId, setFilterStaffId] = useState<string>("all");
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialListError);
  const [message, setMessage] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setAppointments(sortAppointmentsByUpcoming(initialAppointments));
    setStaffOptions(initialStaffOptions);
    setError(initialListError);
  }, [initialAppointments, initialStaffOptions, initialListError]);

  function refreshFromServer() {
    startTransition(async () => {
      setLoading(true);
      const res = await listAppointmentsForTenantAdminAction();
      setLoading(false);
      if (res.error) {
        setError(res.error);
        return;
      }
      setError(null);
      setAppointments(sortAppointmentsByUpcoming(res.items));
      setStaffOptions(res.staffOptions);
      router.refresh();
    });
  }

  async function updateAppointmentStatus(appointmentId: string, status: AppointmentStatus) {
    setError(null);
    setMessage(null);

    setUpdatingId(appointmentId);
    const result = await updateAppointmentStatusAdminAction({ appointmentId, status });
    setUpdatingId(null);

    if (!result.ok) {
      setError(result.error ?? "Randevu güncellenemedi.");
      return;
    }

    setAppointments((prev) =>
      prev.map((item) => (item.id === appointmentId ? { ...item, status } : item))
    );
    setMessage(status === "confirmed" ? "Randevu onaylandı." : "Randevu reddedildi.");
    router.refresh();
  }

  function confirmReject(appointmentId: string) {
    const ok = window.confirm(
      "Bu randevu talebini reddetmek istediğinize emin misiniz? Durum «işletme reddetti» olarak kaydedilir."
    );
    if (!ok) return;
    void updateAppointmentStatus(appointmentId, "cancelled_by_business");
  }

  const pendingCount = useMemo(
    () => appointments.filter((a) => a.status === "pending").length,
    [appointments]
  );

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
          <p className="text-muted-foreground">
            Bekleyen talepleri onaylayın veya reddedin
            {pendingCount > 0 ? (
              <span className="ml-1 font-medium text-foreground">
                ({pendingCount} onay bekliyor)
              </span>
            ) : null}
            .
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" type="button" onClick={() => void refreshFromServer()} disabled={loading}>
            {loading ? "Yenileniyor..." : "Yenile"}
          </Button>
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
      {loading ? <p className="text-sm text-muted-foreground">Randevular güncelleniyor...</p> : null}
      <AppointmentCalendar
        items={visibleAppointments}
        moderationUpdatingId={updatingId}
        onApprovePending={(id) => void updateAppointmentStatus(id, "confirmed")}
        onRejectPending={(id) => confirmReject(id)}
      />

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
                <TableCell className="text-right">
                  {a.status === "pending" ? (
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => void updateAppointmentStatus(a.id, "confirmed")}
                        disabled={updatingId === a.id}
                      >
                        Onayla
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => confirmReject(a.id)}
                        disabled={updatingId === a.id}
                      >
                        Reddet
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
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
