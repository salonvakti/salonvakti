"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import {
  disconnectGoogleCalendarAction,
  getGoogleCalendarDashboardAction,
  saveGoogleCalendarSettingsAction,
} from "@/app/(dashboard)/admin/settings/google-calendar-actions";
import { FeatureGuard } from "@/components/FeatureGuard";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hasGoogleCalendarPackage } from "@/lib/google/calendar-settings";
import type { ResolvedTenantFeatures } from "@/types/features";

const CALLBACK_MESSAGES: Record<string, string> = {
  connected: "Google hesabı bağlandı.",
  error: "Google bağlantısı tamamlanamadı.",
  denied: "Bu işlem için işletme yöneticisi olmalısınız.",
  package: "Google Takvim yalnızca Pro ve Ultimate paketlerde kullanılabilir.",
  config: "Sunucuda Google OAuth yapılandırması eksik.",
  no_refresh: "Google yenileme jetonu alınamadı. Bağlantıyı tekrar deneyin.",
};

export function GoogleCalendarSettingsSection() {
  const searchParams = useSearchParams();
  const [features, setFeatures] = useState<ResolvedTenantFeatures | null>(null);
  const [email, setEmail] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [oauthConnected, setOauthConnected] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [oauthConfigured, setOauthConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const status = searchParams.get("googleCalendar");
    if (status && CALLBACK_MESSAGES[status]) {
      setMessage(CALLBACK_MESSAGES[status]);
    }
  }, [searchParams]);

  useEffect(() => {
    void getGoogleCalendarDashboardAction().then((res) => {
      setLoading(false);
      if (!res.ok || !res.data) {
        setError(res.error ?? "Google Takvim ayarları yüklenemedi.");
        return;
      }
      setFeatures(res.data.features);
      setEmail(res.data.config.email);
      setEnabled(res.data.config.enabled);
      setOauthConnected(res.data.config.oauthConnected);
      setConnectedEmail(res.data.config.connectedEmail);
      setOauthConfigured(res.data.oauthConfigured);
    });
  }, []);

  function save() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const res = await saveGoogleCalendarSettingsAction({ email, enabled });
      if (!res.ok) {
        setError(res.error ?? "Kaydedilemedi.");
        return;
      }
      setMessage("Google Takvim ayarları kaydedildi.");
    });
  }

  function disconnect() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const res = await disconnectGoogleCalendarAction();
      if (!res.ok) {
        setError(res.error ?? "Bağlantı kesilemedi.");
        return;
      }
      setOauthConnected(false);
      setConnectedEmail(null);
      setMessage("Google hesabı bağlantısı kaldırıldı.");
    });
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Google Takvim</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Yükleniyor…</p>
        </CardContent>
      </Card>
    );
  }

  if (!features) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Google Takvim</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error ?? "Yüklenemedi."}</p>
        </CardContent>
      </Card>
    );
  }

  if (!hasGoogleCalendarPackage(features)) {
    return (
      <FeatureGuard
        features={features}
        booleanFeature="googleCalendarSync"
        fallback="upsell"
        upsellTitle="Google Takvim Pro ve Ultimate paketlerde"
        upsellMessage="Onaylı randevuların işletme ve personel Google Takvimlerine otomatik eklenmesi için paketinizi yükseltin."
      >
        <div />
      </FeatureGuard>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Takvim</CardTitle>
        <CardDescription>
          Onaylanan randevular işletme ve personel Google Takvim e-postalarına davet olarak eklenir.
          Önce Google hesabını bağlayın, ardından işletme e-postasını kaydedin.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid max-w-xl gap-4">
        <div className="space-y-2">
          <Label htmlFor="gcal-email">İşletme Google Takvim e-postası</Label>
          <Input
            id="gcal-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@gmail.com"
            disabled={pending}
          />
          <p className="text-xs text-muted-foreground">
            İşletme yöneticisinin randevuları göreceği Gmail / Google hesabı.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            disabled={pending}
            className="size-4 rounded border border-input"
          />
          Google Takvim senkronizasyonu açık
        </label>

        <div className="rounded-lg border bg-muted/30 p-3 text-sm">
          {oauthConnected ? (
            <p>
              Bağlı Google hesabı:{" "}
              <span className="font-medium">{connectedEmail ?? "Bağlı"}</span>
            </p>
          ) : (
            <p className="text-muted-foreground">Henüz Google hesabı bağlanmadı.</p>
          )}
          {!oauthConfigured ? (
            <p className="mt-2 text-xs text-amber-700">
              Sunucuda GOOGLE_CALENDAR_CLIENT_ID ve GOOGLE_CALENDAR_CLIENT_SECRET tanımlanmalıdır.
            </p>
          ) : null}
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => void save()} disabled={pending}>
          {pending ? "Kaydediliyor…" : "Kaydet"}
        </Button>
        {oauthConfigured ? (
          <Link
            href="/api/integrations/google-calendar/connect"
            className={buttonVariants({ variant: "outline" })}
          >
            {oauthConnected ? "Google hesabını yeniden bağla" : "Google hesabını bağla"}
          </Link>
        ) : null}
        {oauthConnected ? (
          <Button type="button" variant="outline" onClick={() => void disconnect()} disabled={pending}>
            Bağlantıyı kaldır
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
