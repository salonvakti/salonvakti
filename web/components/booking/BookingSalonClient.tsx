"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ServiceList } from "@/components/booking/ServiceList";
import { TimeSlotPicker } from "@/components/booking/TimeSlotPicker";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { demoServices } from "@/lib/demo-data";
import type { ServiceSummary } from "@/types/service";

const slots = ["09:30", "10:00", "11:30", "14:00", "15:45", "17:00"];

export function BookingSalonClient({
  salonSlug,
  salonName,
}: {
  salonSlug: string;
  salonName: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(demoServices[0]?.id ?? null);
  const [slot, setSlot] = useState<string | null>(slots[0] ?? null);

  const selected = useMemo<ServiceSummary | null>(
    () => demoServices.find((s) => s.id === selectedId) ?? null,
    [selectedId]
  );

  const canContinue = Boolean(selected && slot);

  const href =
    `/booking/${encodeURIComponent(salonSlug)}/checkout` +
    `?service=${encodeURIComponent(selected?.id ?? "")}&slot=${encodeURIComponent(slot ?? "")}`;

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 lg:grid-cols-[3fr_2fr]">
      <div className="space-y-8">
        <div>
          <p className="text-sm uppercase text-muted-foreground">Çevrimiçi rezervasyon</p>
          <h1 className="text-balance text-3xl font-bold tracking-tight">{salonName}</h1>
          <p className="text-muted-foreground">
            Hizmeti ve zamanı seçerek randevu isteği oluşturun. İşletme onayından sonra işleminiz tamamlanır.
          </p>
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Hizmet seçimi</h2>
          <ServiceList services={demoServices} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Uygun saatler (örnek)</h2>
          <TimeSlotPicker slots={slots} selected={slot} onSelect={setSlot} />
        </div>
      </div>
      <div>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Özet</CardTitle>
            <CardDescription>Slug: {salonSlug}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground">Hizmet</p>
              <p className="font-medium">{selected?.name ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Saat</p>
              <p className="font-medium">{slot ?? "—"}</p>
            </div>
            <Link
              href={canContinue ? href : "#"}
              className={cn(
                buttonVariants(),
                "flex w-full items-center justify-center",
                !canContinue && "pointer-events-none opacity-50"
              )}
              aria-disabled={!canContinue}
              onClick={(e) => {
                if (!canContinue) e.preventDefault();
              }}
            >
              Devam et
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
