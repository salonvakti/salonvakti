"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabaseContext } from "@/components/providers/supabase-provider";

export function ResetPasswordForm() {
  const { client } = useSupabaseContext();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!client) {
      setError("Supabase yapılandırması eksik (.env).");
      return;
    }
    setLoading(true);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error: resetError } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/login`,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setMessage("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
  }

  return (
    <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
      <div className="space-y-2">
        <Label htmlFor="email">E-posta</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Gönderiliyor…" : "Sıfırlama bağlantısı gönder"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="underline underline-offset-4">
          Girişe dön
        </Link>
      </p>
    </form>
  );
}
