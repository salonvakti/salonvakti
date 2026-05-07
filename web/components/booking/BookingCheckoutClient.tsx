"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, Suspense } from "react";
import { SiteFooter } from "@/components/common/SiteFooter";
import { SiteHeader } from "@/components/common/SiteHeader";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { demoServices } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

function BookingCheckoutInner({ salonSlug }: { salonSlug: string }) {
  const params = useSearchParams();
  const serviceId = params.get("service");
  const slot = params.get("slot");
  const service = useMemo(
    () => demoServices.find((s) => s.id === serviceId) ?? null,
    [serviceId]
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const canSubmit = Boolean(service && slot && name && phone);

  const confirmHref =
    `/booking/${encodeURIComponent(salonSlug)}/confirmation` +
    `?service=${encodeURIComponent(serviceId ?? "")}` +
    `&slot=${encodeURIComponent(slot ?? "")}`;

  return (
    <Card className="mx-auto mt-12 w-full max-w-lg">
      <CardHeader>
        <CardTitle>İletişim bilgisi</CardTitle>
        <CardDescription>
          Randevu isteğin işletmenin paneline iletilecek. Kesin tarih işletmenin onayından sonra netleşir.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-muted/40 p-3 text-sm">
          <p>
            <span className="text-muted-foreground">Hizmet: </span>
            <span className="font-medium">{service?.name ?? "Seçili değil"}</span>
          </p>
          <p className="mt-1">
            <span className="text-muted-foreground">Tercih edilen slot: </span>
            <span className="font-medium">{slot ?? "—"}</span>
          </p>
        </div>

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

        <div className="flex gap-3">
          <Link
            href={`/booking/${encodeURIComponent(salonSlug)}`}
            className={buttonVariants({ variant: "outline" })}
          >
            Geri
          </Link>
          <Link
            href={canSubmit ? confirmHref : "#"}
            className={cn(buttonVariants(), "flex-1 text-center", !canSubmit && "pointer-events-none opacity-50")}
            aria-disabled={!canSubmit}
            onClick={(e) => {
              if (!canSubmit) e.preventDefault();
            }}
          >
            Randevuyu gönder
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function BookingCheckoutClient({ salonSlug }: { salonSlug: string }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <Suspense fallback={<p className="px-6 py-10 text-center text-sm text-muted-foreground">Yükleniyor...</p>}>
        <BookingCheckoutInner salonSlug={salonSlug} />
      </Suspense>
      <SiteFooter />
    </div>
  );
}
