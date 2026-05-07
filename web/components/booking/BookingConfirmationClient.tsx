"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SiteFooter } from "@/components/common/SiteFooter";
import { SiteHeader } from "@/components/common/SiteHeader";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { demoServices } from "@/lib/demo-data";

function BookingConfirmationInner({ salonSlug }: { salonSlug: string }) {
  const params = useSearchParams();
  const serviceId = params.get("service");
  const slot = params.get("slot");
  const service = demoServices.find((s) => s.id === serviceId);

  return (
    <div className="mx-auto mt-14 max-w-lg px-4">
      <Card>
        <CardHeader>
          <CardTitle>Randevu isteğin alındı</CardTitle>
          <CardDescription>
            {service?.name ?? "Hizmet"} · {slot ?? "Saat seçimi"} — durum{" "}
            <span className="font-semibold text-amber-700">beklemede</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>İşletme onayı veya iptali sonrasında SMS / e-posta bildirimi (entegrasyon aşaması) gönderilir.</p>
          <Link href={`/booking/${encodeURIComponent(salonSlug)}`} className={buttonVariants()}>
            Yeni randevu
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export function BookingConfirmationClient({ salonSlug }: { salonSlug: string }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <Suspense fallback={<p className="px-6 py-10 text-center text-sm text-muted-foreground">Yükleniyor...</p>}>
        <BookingConfirmationInner salonSlug={salonSlug} />
      </Suspense>
      <SiteFooter />
    </div>
  );
}
