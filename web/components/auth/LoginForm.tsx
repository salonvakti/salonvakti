"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabaseContext } from "@/components/providers/supabase-provider";
import { getDefaultDashboardPath } from "@/lib/auth/permissions";
import { getSessionProfile } from "@/lib/auth/session";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "";

  const { client, refreshSession } = useSupabaseContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const configError = params.get("error") === "config";
  const justRegistered = params.get("registered") === "1";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!client) {
      setError("Supabase yapılandırması eksik (.env).");
      return;
    }
    setLoading(true);
    const { error: signError } = await client.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signError) {
      setError(signError.message);
      return;
    }
    await refreshSession();
    const {
      data: { user },
    } = await client.auth.getUser();
    const profile = getSessionProfile(user);
    const home = getDefaultDashboardPath(profile?.role ?? "customer");
    router.push(next && next.startsWith("/") ? next : home);
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
      {configError ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          Supabase ortam değişkenleri tanımlı değil. Lütfen <code className="font-mono">.env.local</code> dosyasını ekleyin.
        </p>
      ) : null}
      {justRegistered ? (
        <p className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
          İşletme kaydınız tamamlandı. Hesabınıza <strong>10 günlük Basic</strong> deneme lisansı tanımlandı. Aşağıdan giriş
          yapın.
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="email">E-posta</Label>
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Giriş yapılıyor…" : "Giriş yap"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/reset-password" className="underline underline-offset-4">
          Şifremi unuttum
        </Link>
        {" · "}
        <Link href="/register" className="underline underline-offset-4">
          İşletme kaydı
        </Link>
      </p>
    </form>
  );
}
