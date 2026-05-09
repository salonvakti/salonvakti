"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getAvailableBookingSlotsAction } from "@/app/booking/actions";
import { ServiceList } from "@/components/booking/ServiceList";
import { TimeSlotPicker } from "@/components/booking/TimeSlotPicker";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ServiceSummary } from "@/types/service";

function formatTodayLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export type BookingStaffOption = { id: string; displayName: string };

export function BookingSalonClient({
  salonSlug,
  salonName,
  services,
  staffOptions,
}: {
  salonSlug: string;
  salonName: string;
  services: ServiceSummary[];
  staffOptions: BookingStaffOption[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(services[0]?.id ?? null);
  const [staffId, setStaffId] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>(formatTodayLocal);
  const [slots, setSlots] = useState<string[]>([]);
  const [slot, setSlot] = useState<string | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const selected = useMemo<ServiceSummary | null>(
    () => services.find((s) => s.id === selectedId) ?? null,
    [services, selectedId]
  );

  useEffect(() => {
    if (!staffId || !dateStr || !selectedId) {
      setSlots([]);
      setSlot(null);
      setSlotsError(null);
      return;
    }

    let cancelled = false;
    setSlotsLoading(true);
    setSlotsError(null);

    void getAvailableBookingSlotsAction({
      salonSlug,
      staffId,
      dateStr,
      serviceId: selectedId,
    }).then((res) => {
      if (cancelled) return;
      setSlotsLoading(false);
      if (res.error) {
        setSlotsError(res.error);
        setSlots([]);
        setSlot(null);
        return;
      }
      setSlots(res.slots);
      setSlot((prev) =>
        prev && res.slots.includes(prev) ? prev : res.slots[0] ?? null
      );
    });

    return () => {
      cancelled = true;
    };
  }, [salonSlug, staffId, dateStr, selectedId]);

  const canContinue = Boolean(
    selected &&
      slot &&
      staffId &&
      dateStr &&
      staffOptions.length > 0 &&
      !slotsLoading &&
      slots.length > 0
  );

  const href =
    `/booking/${encodeURIComponent(salonSlug)}/checkout` +
    `?service=${encodeURIComponent(selected?.id ?? "")}` +
    `&staff=${encodeURIComponent(staffId)}` +
    `&date=${encodeURIComponent(dateStr)}` +
    `&slot=${encodeURIComponent(slot ?? "")}`;

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 lg:grid-cols-[3fr_2fr]">
      <div className="space-y-8">
        <div>
          <p className="text-sm uppercase text-muted-foreground">Çevrimiçi rezervasyon</p>
          <h1 className="text-balance text-3xl font-bold tracking-tight">{salonName}</h1>
          <p className="text-muted-foreground">
            Hizmeti, personeli ve zamanı seçerek randevu kaydı oluşturun. Müsait saatler mevcut randevular ve işletme
            çalışma saatlerine göre hesaplanır (Türkiye saati).
          </p>
        </div>
        {services.length === 0 ? (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-sm">
            <p className="font-medium text-foreground">Henüz yayında hizmet yok</p>
            <p className="mt-2 text-muted-foreground">
              Bu işletme şu an için randevu hizmeti listelemiyor. İşletme ile doğrudan iletişime geçebilir veya{" "}
              <Link href={`/isletme/${encodeURIComponent(salonSlug)}`} className="font-medium text-primary underline">
                tanıtım sayfası
              </Link>
              ndaki bilgileri kullanabilirsiniz.
            </p>
          </div>
        ) : staffOptions.length === 0 ? (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-sm">
            <p className="font-medium text-foreground">Online randevu için personel tanımlı değil</p>
            <p className="mt-2 text-muted-foreground">
              İşletme yöneticisi personel ekledikten sonra buradan randevu oluşturulabilir.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Hizmet seçimi</h2>
              <ServiceList services={services} selectedId={selectedId} onSelect={setSelectedId} />
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Personel</h2>
              <p className="text-xs text-muted-foreground">
                Randevu seçtiğiniz çalışanın takvimine kaydedilir.
              </p>
              <div className="space-y-2">
                <Label htmlFor="bk-staff">Personel seçimi</Label>
                <select
                  id="bk-staff"
                  className="flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={staffId}
                  required
                  onChange={(e) => setStaffId(e.target.value)}
                >
                  <option value="">— Personel seçin —</option>
                  {staffOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.displayName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Tarih ve saat</h2>
              <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
                <div className="space-y-2">
                  <Label htmlFor="bk-date">Tarih</Label>
                  <input
                    id="bk-date"
                    type="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  {slotsLoading ? (
                    <p className="text-sm text-muted-foreground">Müsait saatler yükleniyor…</p>
                  ) : slotsError ? (
                    <p className="text-sm text-destructive">{slotsError}</p>
                  ) : staffId && dateStr && selectedId && slots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Bu gün için uygun slot yok (işletme kapalı, doluluk veya çalışma saati dışı).
                    </p>
                  ) : (
                    <>
                      <p className="text-xs text-muted-foreground">
                        Çakışan randevular ve işletme çalışma ayarına göre listelenir.
                      </p>
                      <TimeSlotPicker slots={slots} selected={slot} onSelect={setSlot} />
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <div>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Özet</CardTitle>
            <CardDescription>
              <Link
                href={`/isletme/${encodeURIComponent(salonSlug)}`}
                className="text-primary underline underline-offset-4"
              >
                İşletme sayfası
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground">Hizmet</p>
              <p className="font-medium">{selected?.name ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Personel</p>
              <p className="font-medium">
                {staffId ? staffOptions.find((s) => s.id === staffId)?.displayName ?? "—" : "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Tarih</p>
              <p className="font-medium">{dateStr || "—"}</p>
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
                (!canContinue || services.length === 0 || staffOptions.length === 0) &&
                  "pointer-events-none opacity-50"
              )}
              aria-disabled={!canContinue || services.length === 0 || staffOptions.length === 0}
              onClick={(e) => {
                if (!canContinue || services.length === 0 || staffOptions.length === 0) e.preventDefault();
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
