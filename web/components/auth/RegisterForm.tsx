"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabaseContext } from "@/components/providers/supabase-provider";

export function RegisterForm() {
  const router = useRouter();
  const { client, refreshSession } = useSupabaseContext();

  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!client) {
      setError("Supabase yapılandırması eksik (.env).");
      return;
    }
    setLoading(true);
    const { error: signError } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: "business_admin",
          business_name: businessName,
          tenant_slug: slug,
        },
      },
    });
    setLoading(false);
    if (signError) {
      setError(signError.message);
      return;
    }
    setInfo("Doğrulama e-postası gönderildiyse gelen kutunuzu kontrol edin. Ardından giriş yapabilirsiniz.");
    await refreshSession();
    router.push("/login");
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
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Kısa adres (slug)</Label>
        <Input
          id="slug"
          placeholder="ornek-salon"
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
          required
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
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {info ? <p className="text-sm text-muted-foreground">{info}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Kaydediliyor…" : "İşletmeyi oluştur"}
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
