"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, Suspense, useTransition } from "react";
import { createPublicBookingAction } from "@/app/booking/actions";
import { SiteFooter } from "@/components/common/SiteFooter";
import { SiteHeader } from "@/components/common/SiteHeader";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ServiceSummary } from "@/types/service";

function BookingCheckoutInner({
  salonSlug,
  salonName,
  services,
  requiresBranch,
  branchOptions,
}: {
  salonSlug: string;
  salonName: string;
  services: ServiceSummary[];
  requiresBranch: boolean;
  branchOptions: { id: string; name: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const serviceId = params.get("service");
  const slot = params.get("slot");
  const staffId = params.get("staff");
  const dateStr = params.get("date");
  const branchId = params.get("branch");

  const service = useMemo(
    () => services.find((s) => s.id === serviceId) ?? null,
    [services, serviceId]
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const branchOk = !requiresBranch || Boolean(branchId?.trim());

  const canSubmit = Boolean(
    branchOk && service && slot && staffId && dateStr && name.trim() && phone.trim()
  );

  const branchLabel =
    branchId && branchOptions.length
      ? branchOptions.find((b) => b.id === branchId)?.name ?? null
      : null;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !service || !slot || !staffId || !dateStr) return;

    setFormError(null);
    startTransition(async () => {
      const result = await createPublicBookingAction({
        salonSlug,
        serviceId: service.id,
        staffId,
        clientName: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        dateStr,
        slotHHmm: slot,
        branchId: requiresBranch ? branchId : null,
      });

      if (!result.ok || !result.appointmentId) {
        setFormError(result.error ?? "Randevu kaydedilemedi.");
        return;
      }

      router.push(
        `/booking/${encodeURIComponent(salonSlug)}/confirmation?rid=${encodeURIComponent(result.appointmentId)}`
      );
    });
  }

  return (
    <Card className="mx-auto mt-12 w-full max-w-lg">
      <CardHeader>
        <CardTitle>İletişim bilgisi</CardTitle>
        <CardDescription>
          {salonName} — bilgileriniz müşteri kaydı olarak saklanır ve randevu işletme paneline düşer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            {requiresBranch ? (
              <p className="mb-1">
                <span className="text-muted-foreground">Şube: </span>
                <span className="font-medium">{branchLabel ?? "—"}</span>
              </p>
            ) : null}
            <p>
              <span className="text-muted-foreground">Hizmet: </span>
              <span className="font-medium">{service?.name ?? "Seçili değil veya geçersiz"}</span>
            </p>
            <p className="mt-1">
              <span className="text-muted-foreground">Tarih / saat: </span>
              <span className="font-medium">
                {dateStr && slot ? `${dateStr} · ${slot}` : "—"}
              </span>
            </p>
          </div>

          {!service && serviceId ? (
            <p className="text-sm text-destructive">
              Bu hizmet bulunamadı.{" "}
              <Link href={`/booking/${encodeURIComponent(salonSlug)}`} className="underline">
                Randevu adımına dönün
              </Link>
              .
            </p>
          ) : null}

          {service && (!staffId || !dateStr || !slot) ? (
            <p className="text-sm text-destructive">
              Personel, tarih veya saat eksik.{" "}
              <Link href={`/booking/${encodeURIComponent(salonSlug)}`} className="underline">
                Randevu adımına dönün
              </Link>
              .
            </p>
          ) : null}

          {requiresBranch && service && staffId && dateStr && slot && !branchId ? (
            <p className="text-sm text-destructive">
              Şube seçimi eksik.{" "}
              <Link href={`/booking/${encodeURIComponent(salonSlug)}`} className="underline">
                Randevu adımına dönün
              </Link>
              .
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="bk-name">Ad soyad</Label>
            <Input id="bk-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bk-phone">Telefon</Label>
            <Input id="bk-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bk-email">E-posta (isteğe bağlı)</Label>
            <Input id="bk-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

          <div className="flex gap-3">
            <Link
              href={`/booking/${encodeURIComponent(salonSlug)}`}
              className={buttonVariants({ variant: "outline" })}
            >
              Geri
            </Link>
            <button
              type="submit"
              className={cn(buttonVariants(), "flex-1", (!canSubmit || pending) && "opacity-50")}
              disabled={!canSubmit || pending}
            >
              {pending ? "Kaydediliyor…" : "Randevuyu kaydet"}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function BookingCheckoutClient({
  salonSlug,
  salonName,
  services,
  requiresBranch,
  branchOptions,
}: {
  salonSlug: string;
  salonName: string;
  services: ServiceSummary[];
  requiresBranch: boolean;
  branchOptions: { id: string; name: string }[];
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <Suspense fallback={<p className="px-6 py-10 text-center text-sm text-muted-foreground">Yükleniyor...</p>}>
        <BookingCheckoutInner
          salonSlug={salonSlug}
          salonName={salonName}
          services={services}
          requiresBranch={requiresBranch}
          branchOptions={branchOptions}
        />
      </Suspense>
      <SiteFooter />
    </div>
  );
}
