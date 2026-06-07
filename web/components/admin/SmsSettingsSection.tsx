"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import {
  getSmsDashboardAction,
  saveNetgsmSettingsAction,
} from "@/app/(dashboard)/admin/sms/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hasSmsPackage } from "@/lib/sms/sms-quota-shared";

export function SmsSettingsSection() {
  const [loading, setLoading] = useState(true);
  const [smsAvailable, setSmsAvailable] = useState(false);
  const [usercode, setUsercode] = useState("");
  const [password, setPassword] = useState("");
  const [msgheader, setMsgheader] = useState("");
  const [appname, setAppname] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [passwordSet, setPasswordSet] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    void getSmsDashboardAction().then((res) => {
      setLoading(false);
      if (!res.ok || !res.data) {
        setError(res.error ?? "SMS ayarları yüklenemedi.");
        return;
      }
      const { features, config } = res.data;
      setSmsAvailable(hasSmsPackage(features));
      setUsercode(config.usercode);
      setMsgheader(config.msgheader);
      setAppname(config.appname ?? "");
      setEnabled(config.enabled);
      setPasswordSet(config.passwordSet);
    });
  }, []);

  function save() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const res = await saveNetgsmSettingsAction({
        usercode,
        password: password.trim() || null,
        msgheader,
        appname: appname.trim() || null,
        enabled,
      });
      if (!res.ok) {
        setError(res.error ?? "Kaydedilemedi.");
        return;
      }
      setPassword("");
      setPasswordSet(true);
      setMessage("Netgsm ayarları kaydedildi.");
    });
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SMS (Netgsm)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Yükleniyor…</p>
        </CardContent>
      </Card>
    );
  }

  if (!smsAvailable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SMS (Netgsm)</CardTitle>
          <CardDescription>
            SMS gönderimi Pro ve Ultimate paketlerde kullanılabilir. Mevcut paketinizde bu özellik kapalıdır.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Paket yükseltmesi için platform yöneticinizle iletişime geçin.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SMS (Netgsm)</CardTitle>
        <CardDescription>
          Her işletme kendi Netgsm hesabıyla SMS gönderir.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="netgsm-user">Kullanıcı kodu (usercode)</Label>
          <Input
            id="netgsm-user"
            value={usercode}
            onChange={(e) => setUsercode(e.target.value)}
            disabled={pending}
            placeholder="Netgsm API kullanıcı adı"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="netgsm-pass">API şifresi</Label>
          <Input
            id="netgsm-pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={pending}
            placeholder={passwordSet ? "Değiştirmek için yeni şifre girin" : "Netgsm API şifresi"}
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="netgsm-header">Mesaj başlığı (msgheader)</Label>
          <Input
            id="netgsm-header"
            value={msgheader}
            onChange={(e) => setMsgheader(e.target.value)}
            disabled={pending}
            placeholder="Onaylı gönderici adı"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="netgsm-app">Uygulama adı (isteğe bağlı)</Label>
          <Input
            id="netgsm-app"
            value={appname}
            onChange={(e) => setAppname(e.target.value)}
            disabled={pending}
            placeholder="SalonVakti"
          />
        </div>
        <div className="flex items-center gap-2 md:col-span-2">
          <input
            id="netgsm-enabled"
            type="checkbox"
            className="h-4 w-4 accent-primary"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            disabled={pending}
          />
          <Label htmlFor="netgsm-enabled" className="font-normal">
            SMS gönderimi aktif
          </Label>
        </div>
        {error ? <p className="text-sm text-destructive md:col-span-2">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-700 md:col-span-2">{message}</p> : null}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => void save()} disabled={pending}>
          {pending ? "Kaydediliyor…" : "Netgsm ayarlarını kaydet"}
        </Button>
        <Link href="/admin/sms" className={buttonVariants({ variant: "outline" })}>
          SMS gönder ve geçmiş
        </Link>
      </CardFooter>
    </Card>
  );
}
