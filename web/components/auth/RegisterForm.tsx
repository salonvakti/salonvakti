"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerBusinessAction } from "@/app/(auth)/register/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeTenantSlug } from "@/lib/tenant/slug";

export function RegisterForm() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await registerBusinessAction({
        businessName,
        slugRaw: slug,
        email,
        password,
      });
      if (!result.ok && result.error) {
        setError(result.error);
        return;
      }
      router.push("/login?registered=1");
    });
  }

  return (
    <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
      <div className="space-y-2">
        <Label htmlFor="biz">İşletme adı</Label>
        <Input
          id="biz"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
          disabled={pending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Kısa adres (slug)</Label>
        <Input
          id="slug"
          placeholder="ornek-salon"
          value={slug}
          onChange={(e) => setSlug(normalizeTenantSlug(e.target.value))}
          required
          disabled={pending}
        />
        <p className="text-xs text-muted-foreground">
          Randevu linki: <span className="font-mono">/booking/{slug || "…"}</span>
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Yönetici e-postası</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={pending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Şifre</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          disabled={pending}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <p className="text-xs text-muted-foreground">
        Kayıt sonrası işletmenize <strong>10 günlük Basic</strong> deneme lisansı atanır (başlangıç: kayıt anı).
      </p>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Kaydediliyor…" : "İşletmeyi oluştur"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Zaten hesabınız var mı?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Giriş
        </Link>
      </p>
    </form>
  );
}
