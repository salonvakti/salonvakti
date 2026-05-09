"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SiteFooter } from "@/components/common/SiteFooter";
import { SiteHeader } from "@/components/common/SiteHeader";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PublicAppointmentConfirmation } from "@/lib/booking/public-confirmation";
import type { ServiceSummary } from "@/types/service";

function formatDisplayLocal(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return iso;
  return d.toLocaleString("tr-TR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function BookingConfirmationInner({
  salonSlug,
  salonName,
  services,
  serverConfirmation,
}: {
  salonSlug: string;
  salonName: string;
  services: ServiceSummary[];
  serverConfirmation: PublicAppointmentConfirmation | null;
}) {
  const params = useSearchParams();
  const serviceId = params.get("service");
  const slot = params.get("slot");
  const service = services.find((s) => s.id === serviceId);

  if (serverConfirmation) {
    const statusLabel =
      serverConfirmation.status === "pending"
        ? "beklemede"
        : serverConfirmation.status === "confirmed"
          ? "onaylı"
          : serverConfirmation.status;

    return (
      <div className="mx-auto mt-14 max-w-lg px-4">
        <Card>
          <CardHeader>
            <CardTitle>Randevunuz kaydedildi</CardTitle>
            <CardDescription>
              {salonName} — {serverConfirmation.serviceName}
              {serverConfirmation.staffName ? ` · ${serverConfirmation.staffName}` : ""} ·{" "}
              {formatDisplayLocal(serverConfirmation.startTime)} — durum{" "}
              <span className="font-semibold text-amber-700">{statusLabel}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              İşletme onayı veya iptalından sonra bilgilendirilirsiniz. Kayıtlı müşteri hesabınız varsa
              randevularınızı{" "}
              <Link href="/client/my-bookings" className="font-medium text-primary underline underline-offset-4">
                Randevularım
              </Link>{" "}
              sayfasında görebilirsiniz (hesabınız müşteri kaydınızla eşleştiğinde).
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href={`/booking/${encodeURIComponent(salonSlug)}`} className={buttonVariants()}>
                Yeni randevu
              </Link>
              <Link
                href={`/isletme/${encodeURIComponent(salonSlug)}`}
                className={buttonVariants({ variant: "outline" })}
              >
                İşletme sayfası
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-14 max-w-lg px-4">
      <Card>
        <CardHeader>
          <CardTitle>Randevu isteğin alındı</CardTitle>
          <CardDescription>
            {salonName} — {service?.name ?? "Hizmet"} · {slot ?? "Saat"} — durum{" "}
            <span className="font-semibold text-amber-700">beklemede</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Detaylı kayıt bağlantısı için önce randevu akışını tamamlayın. Kayıtlı müşteri hesabınız varsa
            randevularınızı{" "}
            <Link href="/client/my-bookings" className="font-medium text-primary underline underline-offset-4">
              Randevularım
            </Link>{" "}
            sayfasında görebilirsiniz.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href={`/booking/${encodeURIComponent(salonSlug)}`} className={buttonVariants()}>
              Yeni randevu
            </Link>
            <Link
              href={`/isletme/${encodeURIComponent(salonSlug)}`}
              className={buttonVariants({ variant: "outline" })}
            >
              İşletme sayfası
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function BookingConfirmationClient({
  salonSlug,
  salonName,
  services,
  serverConfirmation,
}: {
  salonSlug: string;
  salonName: string;
  services: ServiceSummary[];
  serverConfirmation: PublicAppointmentConfirmation | null;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <Suspense fallback={<p className="px-6 py-10 text-center text-sm text-muted-foreground">Yükleniyor...</p>}>
        <BookingConfirmationInner
          salonSlug={salonSlug}
          salonName={salonName}
          services={services}
          serverConfirmation={serverConfirmation}
        />
      </Suspense>
      <SiteFooter />
    </div>
  );
}
