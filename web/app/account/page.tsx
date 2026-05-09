"use client";

import { useEffect, useState } from "react";
import { useSupabaseContext } from "@/components/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SessionProfile } from "@/lib/auth/session";
import { isBusinessRole } from "@/lib/constants/roles";
import type { SupabaseClient } from "@supabase/supabase-js";

function initialNames(meta: Record<string, unknown>): { first: string; last: string } {
  const f = typeof meta.first_name === "string" ? meta.first_name : "";
  const l = typeof meta.last_name === "string" ? meta.last_name : "";
  if (f.trim() || l.trim()) return { first: f, last: l };
  const d = typeof meta.display_name === "string" ? meta.display_name.trim() : "";
  if (d) {
    const parts = d.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return { first: parts[0], last: "" };
    return { first: parts[0], last: parts.slice(1).join(" ") };
  }
  return { first: "", last: "" };
}

async function syncStaffDisplayName(
  client: SupabaseClient,
  profile: SessionProfile | null,
  userId: string,
  displayName: string
): Promise<string | null> {
  const trimmed = displayName.trim();
  if (!profile?.tenantId || !trimmed) return null;
  if (!isBusinessRole(profile.role)) return null;

  let q = client
    .from("staff")
    .update({ display_name: trimmed })
    .eq("tenant_id", profile.tenantId);

  if (profile.staffId) {
    q = q.eq("id", profile.staffId);
  } else {
    q = q.eq("user_id", userId);
  }

  const { error } = await q;
  return error?.message ?? null;
}

export default function AccountSettingsPage() {
  const { client, session, profile, refreshSession } = useSupabaseContext();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileErr, setProfileErr] = useState<string | null>(null);

  const [emailBusy, setEmailBusy] = useState(false);
  const [emailMsg, setEmailMsg] = useState<string | null>(null);
  const [emailErr, setEmailErr] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordErr, setPasswordErr] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) return;
    const meta = session.user.user_metadata ?? {};
    const { first, last } = initialNames(meta);
    setFirstName(first);
    setLastName(last);
    setPhone(typeof meta.phone === "string" ? meta.phone : "");
    setEmail(session.user.email ?? "");
  }, [session]);

  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileErr(null);
    setProfileMsg(null);
    if (!client || !session?.user) {
      setProfileErr("Oturum bulunamadı.");
      return;
    }

    const meta = { ...(session.user.user_metadata ?? {}) };
    const f = firstName.trim();
    const l = lastName.trim();
    const displayName = [f, l].filter(Boolean).join(" ").trim();
    const nextMeta = {
      ...meta,
      first_name: f || null,
      last_name: l || null,
      phone: phone.trim() || null,
    };
    if (displayName) {
      (nextMeta as Record<string, unknown>).display_name = displayName;
    }

    setProfileBusy(true);
    const { error } = await client.auth.updateUser({ data: nextMeta as Record<string, unknown> });

    if (error) {
      setProfileErr(error.message);
    } else {
      const staffSyncErr = await syncStaffDisplayName(
        client,
        profile,
        session.user.id,
        displayName
      );
      setProfileMsg(
        staffSyncErr
          ? `Profil güncellendi. Personel adı kaydı güncellenemedi: ${staffSyncErr}`
          : "Profil bilgileri güncellendi."
      );
      await refreshSession();
    }
    setProfileBusy(false);
  }

  async function onSaveEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailErr(null);
    setEmailMsg(null);
    if (!client) {
      setEmailErr("Bağlantı kurulamadı.");
      return;
    }
    const next = email.trim().toLowerCase();
    if (!next.includes("@")) {
      setEmailErr("Geçerli bir e-posta girin.");
      return;
    }
    if (next === session?.user?.email?.toLowerCase()) {
      setEmailMsg("E-posta zaten bu adrese ayarlı.");
      return;
    }

    setEmailBusy(true);
    const { error } = await client.auth.updateUser({ email: next });

    if (error) {
      setEmailErr(error.message);
    } else {
      setEmailMsg(
        "İstek gönderildi. Projede e-posta onayı açıksa yeni adrese doğrulama bağlantısı gidebilir; gelen kutunuzu kontrol edin."
      );
      await refreshSession();
    }
    setEmailBusy(false);
  }

  async function onSavePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordErr(null);
    setPasswordMsg(null);
    if (!client) {
      setPasswordErr("Bağlantı kurulamadı.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordErr("Şifre en az 6 karakter olmalıdır.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErr("Şifre tekrarı eşleşmiyor.");
      return;
    }

    setPasswordBusy(true);
    const { error } = await client.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordErr(error.message);
    } else {
      setPasswordMsg("Şifre güncellendi.");
      setNewPassword("");
      setConfirmPassword("");
      await refreshSession();
    }
    setPasswordBusy(false);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hesabım</h1>
        <p className="text-muted-foreground">
          Ad soyad, iletişim, e-posta ve şifre ayarlarınız tüm kullanıcı tipleri için buradan
          yönetilir.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kişisel bilgiler</CardTitle>
          <CardDescription>Ad, soyad ve telefon hesap kaydınızda saklanır.</CardDescription>
        </CardHeader>
        <form onSubmit={(ev) => void onSaveProfile(ev)}>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first">Ad</Label>
              <Input
                id="first"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                disabled={profileBusy}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last">Soyad</Label>
              <Input
                id="last"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                disabled={profileBusy}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                disabled={profileBusy}
              />
            </div>
            {profileErr ? <p className="text-sm text-destructive sm:col-span-2">{profileErr}</p> : null}
            {profileMsg ? (
              <p className="text-sm text-muted-foreground sm:col-span-2">{profileMsg}</p>
            ) : null}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={profileBusy}>
              {profileBusy ? "Kaydediliyor…" : "Profili kaydet"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>E-posta</CardTitle>
          <CardDescription>
            Giriş adresinizi değiştirir. Supabase ayarlarınıza bağlı olarak yeni e-postayı onaylamanız
            gerekebilir.
          </CardDescription>
        </CardHeader>
        <form onSubmit={(ev) => void onSaveEmail(ev)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={emailBusy}
              />
            </div>
            {emailErr ? <p className="text-sm text-destructive">{emailErr}</p> : null}
            {emailMsg ? <p className="text-sm text-muted-foreground">{emailMsg}</p> : null}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={emailBusy}>
              {emailBusy ? "Güncelleniyor…" : "E-postayı güncelle"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Şifre</CardTitle>
          <CardDescription>Oturum açıkken yeni şifre belirleyebilirsiniz.</CardDescription>
        </CardHeader>
        <form onSubmit={(ev) => void onSavePassword(ev)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pw">Yeni şifre</Label>
              <Input
                id="pw"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={passwordBusy}
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pw2">Yeni şifre (tekrar)</Label>
              <Input
                id="pw2"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={passwordBusy}
                minLength={6}
              />
            </div>
            {passwordErr ? <p className="text-sm text-destructive">{passwordErr}</p> : null}
            {passwordMsg ? <p className="text-sm text-muted-foreground">{passwordMsg}</p> : null}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={passwordBusy}>
              {passwordBusy ? "Kaydediliyor…" : "Şifreyi güncelle"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
