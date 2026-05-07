"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AppointmentSummary } from "@/types/appointment";
import { Badge } from "@/components/ui/badge";

const statusLabel: Record<AppointmentSummary["status"], string> = {
  pending: "Beklemede",
  confirmed: "Onaylı",
  cancelled_by_business: "İşletme iptal",
  cancelled_by_client: "Müşteri iptal",
  completed: "Tamamlandı",
};

type Props = {
  items: AppointmentSummary[];
  title?: string;
};

/** İlk sürüm: liste görünümü; FullCalendar vb. sonra eklenebilir. */
export function AppointmentCalendar({ items, title = "Randevular" }: Props) {
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
                className="flex flex-col gap-1 rounded-lg border bg-card p-3 text-sm md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium">{a.clientName}</p>
                  <p className="text-muted-foreground">
                    {a.serviceName}
                    {a.staffName ? ` · ${a.staffName}` : ""}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-1 md:items-end">
                  <span>{new Date(a.startTime).toLocaleString("tr-TR")}</span>
                  <Badge variant={a.status === "pending" ? "secondary" : "default"} className="text-xs">
                    {statusLabel[a.status]}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
