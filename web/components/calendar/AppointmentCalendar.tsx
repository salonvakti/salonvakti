"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AppointmentSummary } from "@/types/appointment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusLabel: Record<AppointmentSummary["status"], string> = {
  pending: "Beklemede",
  confirmed: "Onaylı",
  cancelled_by_business: "İşletme iptal",
  cancelled_by_client: "Müşteri iptal",
  completed: "Tamamlandı",
};

function getStatusBadgeClass(status: AppointmentSummary["status"]): string {
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

type Props = {
  items: AppointmentSummary[];
  title?: string;
  /** Bekleyen randevularda liste içinden onay / red (admin randevular sayfası). */
  onApprovePending?: (appointmentId: string) => void;
  onRejectPending?: (appointmentId: string) => void;
  moderationUpdatingId?: string | null;
};

/** İlk sürüm: liste görünümü; FullCalendar vb. sonra eklenebilir. */
export function AppointmentCalendar({
  items,
  title = "Randevular",
  onApprovePending,
  onRejectPending,
  moderationUpdatingId,
}: Props) {
  const showModeration = Boolean(onApprovePending && onRejectPending);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[min(60vh,480px)] pr-3">
          <ul className="space-y-3">
            {items.map((a) => (
              <li
                key={a.id}
                className="flex flex-col gap-2 rounded-lg border bg-card p-3 text-sm md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium">{a.clientName}</p>
                  <p className="text-muted-foreground">
                    {a.serviceName}
                    {a.staffName ? ` · ${a.staffName}` : ""}
                  </p>
                </div>
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3 md:flex-col md:items-end lg:flex-row lg:items-center">
                  <div className="flex flex-col items-start gap-1 md:items-end">
                    <span>{new Date(a.startTime).toLocaleString("tr-TR")}</span>
                    <Badge className={getStatusBadgeClass(a.status)}>
                      {statusLabel[a.status]}
                    </Badge>
                  </div>
                  {showModeration && a.status === "pending" ? (
                    <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={moderationUpdatingId === a.id}
                        onClick={() => onApprovePending?.(a.id)}
                      >
                        Onayla
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={moderationUpdatingId === a.id}
                        onClick={() => onRejectPending?.(a.id)}
                      >
                        Reddet
                      </Button>
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
