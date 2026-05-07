"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { ServiceSummary } from "@/types/service";
import { cn } from "@/lib/utils";

type Props = {
  services: ServiceSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function ServiceList({ services, selectedId, onSelect }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s) => {
        const active = selectedId === s.id;
        return (
          <Card
            key={s.id}
            className={cn(
              "cursor-pointer transition-[box-shadow]",
              active && "ring-2 ring-primary shadow-md"
            )}
            onClick={() => onSelect(s.id)}
          >
            <CardHeader>
              <CardTitle className="text-base">{s.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {s.durationMinutes} dk · {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(s.price)}
            </CardContent>
            {s.description ? <CardFooter className="text-sm">{s.description}</CardFooter> : null}
          </Card>
        );
      })}
    </div>
  );
}

export function BookingServicePlaceholder() {
  return (
    <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-center text-sm text-muted-foreground">
      Hizmet listesi seçildikten sonra burada özeti görebilirsiniz.
    </div>
  );
}
