"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { updateLandingPackagePricesAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LandingPackageSlug } from "@/lib/landing/package-prices";

type Props = {
  initial: Record<LandingPackageSlug, string>;
};

export function PlatformPackagesForm({ initial }: Props) {
  const router = useRouter();
  const [basic, setBasic] = useState(initial.basic);
  const [pro, setPro] = useState(initial.pro);
  const [ultimate, setUltimate] = useState(initial.ultimate);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setBasic(initial.basic);
    setPro(initial.pro);
    setUltimate(initial.ultimate);
  }, [initial.basic, initial.pro, initial.ultimate]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    startTransition(async () => {
      const r = await updateLandingPackagePricesAction({ basic, pro, ultimate });
      if (r.ok) {
        setMsg("Fiyatlar kaydedildi.");
        router.refresh();
      } else {
        setErr(r.error ?? "Kayıt başarısız.");
      }
    });
  }

  return (
    <form onSubmit={(ev) => void onSubmit(ev)} className="max-w-xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="price-basic">Basic — ana sayfada gösterilecek fiyat metni</Label>
        <Input
          id="price-basic"
          value={basic}
          onChange={(e) => setBasic(e.target.value)}
          disabled={pending}
          placeholder="örn. 990 ₺ / ay"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price-pro">Pro</Label>
        <Input
          id="price-pro"
          value={pro}
          onChange={(e) => setPro(e.target.value)}
          disabled={pending}
          placeholder="örn. 2.990 ₺ / ay"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price-ultimate">Ultimate</Label>
        <Input
          id="price-ultimate"
          value={ultimate}
          onChange={(e) => setUltimate(e.target.value)}
          disabled={pending}
          placeholder="örn. İletişime geçin"
        />
      </div>
      {err ? <p className="text-sm text-destructive">{err}</p> : null}
      {msg ? <p className="text-sm text-muted-foreground">{msg}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Kaydediliyor…" : "Kaydet"}
      </Button>
    </form>
  );
}
