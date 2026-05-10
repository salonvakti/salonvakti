"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSupabaseContext } from "@/components/providers/supabase-provider";
import { Button, buttonVariants } from "@/components/ui/button";
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
import {
  mergeLandingIntoSettingsJson,
  pickPublicAddress,
  pickPublicPromo,
} from "@/lib/public/tenant-public-fields";
import { BranchesSettingsSection } from "@/components/admin/BranchesSettingsSection";

export default function AdminSettingsPage() {
  const { client, profile, session } = useSupabaseContext();

  const [salonName, setSalonName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [promoText, setPromoText] = useState("");
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
        .select("name,phone,address,promo_text,settings_json")
        .eq("id", profile.tenantId)
        .maybeSingle();

      if (!active) return;

      if (error || !data) {
        setSalonName(initialName);
        setPhone("");
        setAddress("");
        setPromoText("");
      } else {
        const raw = data as Record<string, unknown>;
        setSalonName(typeof raw.name === "string" ? raw.name : initialName);
        setPhone(typeof raw.phone === "string" ? raw.phone : "");
        setAddress(pickPublicAddress(raw) ?? "");
        setPromoText(pickPublicPromo(raw) ?? "");
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

    const { data: existingRow } = await client
      .from("tenants")
      .select("settings_json")
      .eq("id", profile.tenantId)
      .maybeSingle();

    const mergedSettings = mergeLandingIntoSettingsJson(existingRow?.settings_json, {
      promo: promoText.trim() || null,
      address: address.trim() || null,
    });

    const basePayload = {
      name: salonName.trim(),
      phone: phone.trim() || null,
      address: address.trim() || null,
      settings_json: mergedSettings,
    };

    let { error } = await client
      .from("tenants")
      .update({
        ...basePayload,
        promo_text: promoText.trim() || null,
      })
      .eq("id", profile.tenantId);

    if (error && error.message.includes("promo_text")) {
      ({ error } = await client.from("tenants").update(basePayload).eq("id", profile.tenantId));
    }

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
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="promo">Genel tanıtım metni</Label>
            <textarea
              id="promo"
              rows={5}
              value={promoText}
              onChange={(e) => setPromoText(e.target.value)}
              disabled={loadingProfile || savingProfile}
              placeholder="İşletmenizi tanıtan kısa metin; /isletme sayfanızda ve arama sonuçlarında kullanılır."
              className="flex min-h-[120px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30"
            />
            <p className="text-xs text-muted-foreground">
              Bu metin herkese açık işletme sayfasında gösterilir (SEO için önemli).
            </p>
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

      <BranchesSettingsSection />

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
          <CardTitle>Personel</CardTitle>
          <CardDescription>
            Yeni personel hesabı (e-posta / şifre) ve takvim rengi için Personel sayfasını kullanın.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/admin/staff" className={buttonVariants({ variant: "outline" })}>
            Personel sayfasına git
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
