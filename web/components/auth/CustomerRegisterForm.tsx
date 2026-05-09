"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { registerCustomerAction } from "@/app/(auth)/customer/register/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CustomerRegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "";
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await registerCustomerAction({
        email,
        password,
        displayName: displayName.trim() || null,
      });
      if (!result.ok && result.error) {
        setError(result.error);
        return;
      }
      const q = new URLSearchParams({ registered: "1" });
      if (next && next.startsWith("/")) q.set("next", next);
      router.push(`/customer/login?${q.toString()}`);
    });
  }

  return (
    <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
      <div className="space-y-2">
        <Label htmlFor="cd-name">Ad soyad (isteğe bağlı)</Label>
        <Input
          id="cd-name"
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={pending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cd-email">E-posta</Label>
        <Input
          id="cd-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={pending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cd-password">Şifre</Label>
        <Input
          id="cd-password"
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
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Kaydediliyor…" : "Müşteri hesabı oluştur"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/customer/login" className="underline underline-offset-4">
          Zaten hesabım var
        </Link>
        {" · "}
        <Link href="/login" className="underline underline-offset-4">
          İşletme girişi
        </Link>
      </p>
    </form>
  );
}
