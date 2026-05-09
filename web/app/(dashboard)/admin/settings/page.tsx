"use client";

import { useEffect, useState } from "react";
import { StaffForm } from "@/components/forms/StaffForm";
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

export default function AdminSettingsPage() {
  const { client, profile, session } = useSupabaseContext();

  const [salonName, setSalonName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [opened, setOpened] = useState("09:00");
  const [closed, setClosed] = useState("20:00");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadBusinessProfile() {
      setSaveError(null);

      const metadata = session?.user.user_metadata ?? {};
      const initialName =
        typeof metadata.business_name === "string" ? metadata.business_name : "";

      if (!client || !profile?.tenantId) {
        if (!active) return;
        setSalonName(initialName);
        setLoadingProfile(false);
        return;
      }

      const { data, error } = await client
        .from("tenants")
        .select("name,phone,address")
        .eq("id", profile.tenantId)
        .single();

      if (!active) return;

      if (error) {
        setSalonName(initialName);
        setSaveError("İşletme bilgileri yüklenemedi, varsayılan bilgiler gösteriliyor.");
      } else {
        setSalonName(data?.name ?? initialName);
        setPhone(data?.phone ?? "");
        setAddress(data?.address ?? "");
      }

      setLoadingProfile(false);
    }

    void loadBusinessProfile();

    return () => {
      active = false;
    };
  }, [client, profile?.tenantId, session?.user.user_metadata]);

  async function onSaveBusinessProfile() {
    setSaveMessage(null);
    setSaveError(null);

    if (!client) {
      setSaveError("Supabase bağlantısı yok. Ortam değişkenlerini kontrol edin.");
      return;
    }

    if (!profile?.tenantId) {
      setSaveError("İşletme kaydı bulunamadı (tenant_id eksik).");
      return;
    }

    setSavingProfile(true);

    const { error } = await client
      .from("tenants")
      .update({
        name: salonName.trim(),
        phone: phone.trim() || null,
        address: address.trim() || null,
      })
      .eq("id", profile.tenantId);

    if (!error) {
      await client.auth.updateUser({
        data: {
          business_name: salonName.trim(),
        },
      });
      setSaveMessage("İşletme bilgileri kaydedildi.");
    } else {
      setSaveError(`Kaydetme başarısız: ${error.message}`);
    }

    setSavingProfile(false);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Salon ayarları</h1>
        <p className="text-muted-foreground">Çalışma saatleri, logo ve bildirim tercihleri.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>İşletme profili</CardTitle>
          <CardDescription>Görünen ad ve müşteri sayfasında gösterilen bilgiler.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="salon-name">Salon adı</Label>
            <Input
              id="salon-name"
              value={salonName}
              onChange={(e) => setSalonName(e.target.value)}
              disabled={loadingProfile || savingProfile}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loadingProfile || savingProfile}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Adres</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={loadingProfile || savingProfile}
            />
          </div>
          {saveError ? <p className="text-sm text-destructive md:col-span-2">{saveError}</p> : null}
          {saveMessage ? (
            <p className="text-sm text-muted-foreground md:col-span-2">{saveMessage}</p>
          ) : null}
        </CardContent>
        <CardFooter>
          <Button onClick={() => void onSaveBusinessProfile()} disabled={loadingProfile || savingProfile}>
            {savingProfile ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Çalışma saatleri</CardTitle>
          <CardDescription>Takvimde üretilecek slotlar bu aralığa göre hesaplanır.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="space-y-2">
            <Label htmlFor="open">Açılış</Label>
            <Input id="open" type="time" value={opened} onChange={(e) => setOpened(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="close">Kapanış</Label>
            <Input id="close" type="time" value={closed} onChange={(e) => setClosed(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personel artır</CardTitle>
          <CardDescription>Yeni personel kaydı ve takvim rengi.</CardDescription>
        </CardHeader>
        <CardContent>
          <StaffForm
            onSubmit={() => {
              /* Supabase insert */
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
