"use client";

import { useState, useTransition } from "react";
import { saveCustomerProfileAction } from "@/app/(dashboard)/client/profile-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CustomerProfileData } from "@/lib/customer/profile";
import { cn } from "@/lib/utils";

const textareaClass =
  "flex min-h-[88px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30";

type Props = {
  initial: CustomerProfileData;
  showLinkedSalons?: boolean;
  onSaved?: () => void;
};

export function CustomerProfileForm({ initial, showLinkedSalons = false, onSaved }: Props) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [birthDate, setBirthDate] = useState(initial.birthDate ?? "");
  const [allergenStatus, setAllergenStatus] = useState(initial.allergenStatus ?? "");
  const [regularMedications, setRegularMedications] = useState(initial.regularMedications ?? "");
  const [chronicConditionPregnancy, setChronicConditionPregnancy] = useState(
    initial.chronicConditionPregnancy ?? ""
  );
  const [skinHairType, setSkinHairType] = useState(initial.skinHairType ?? "");
  const [kvkkConsent, setKvkkConsent] = useState(initial.kvkkConsent);
  const [commercialConsent, setCommercialConsent] = useState(initial.commercialConsent);
  const [serviceRiskConsent, setServiceRiskConsent] = useState(initial.serviceRiskConsent);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const res = await saveCustomerProfileAction({
        firstName,
        lastName,
        phone: phone.trim() || null,
        birthDate: birthDate.trim() || null,
        allergenStatus: allergenStatus.trim() || null,
        regularMedications: regularMedications.trim() || null,
        chronicConditionPregnancy: chronicConditionPregnancy.trim() || null,
        skinHairType: skinHairType.trim() || null,
        kvkkConsent,
        commercialConsent,
        serviceRiskConsent,
      });

      if (!res.ok) {
        setError(res.error ?? "Kaydedilemedi.");
        return;
      }

      setMessage("Profiliniz kaydedildi. Tüm bağlı işletme kayıtlarınız güncellendi.");
      onSaved?.();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Kişisel bilgiler</CardTitle>
          <CardDescription>
            Ad, soyad ve telefon tüm işletmelerde aynı kayıt olarak kullanılır. E-posta değişikliği Hesabım
            sayfasından yapılır.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cp-first">Ad</Label>
            <Input
              id="cp-first"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              required
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cp-last">Soyad</Label>
            <Input
              id="cp-last"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              disabled={pending}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="cp-phone">Telefon</Label>
            <Input
              id="cp-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              disabled={pending}
            />
          </div>
          {initial.email ? (
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="cp-email">E-posta</Label>
              <Input id="cp-email" type="email" value={initial.email} disabled readOnly className="bg-muted/50" />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sağlık ve tercih bilgileri</CardTitle>
          <CardDescription>Randevu ve hizmet planlaması için işletmelerle paylaşılabilir.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cp-birth">Doğum tarihi</Label>
            <Input
              id="cp-birth"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              disabled={pending}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="cp-allergen">Alerjen durumu</Label>
            <textarea
              id="cp-allergen"
              rows={2}
              value={allergenStatus}
              onChange={(e) => setAllergenStatus(e.target.value)}
              disabled={pending}
              className={textareaClass}
              placeholder="Bilinen alerjiler, hassasiyetler…"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="cp-meds">Kullanılan düzenli ilaçlar</Label>
            <textarea
              id="cp-meds"
              rows={2}
              value={regularMedications}
              onChange={(e) => setRegularMedications(e.target.value)}
              disabled={pending}
              className={textareaClass}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="cp-chronic">Kronik rahatsızlık / hamilelik durumu</Label>
            <textarea
              id="cp-chronic"
              rows={2}
              value={chronicConditionPregnancy}
              onChange={(e) => setChronicConditionPregnancy(e.target.value)}
              disabled={pending}
              className={textareaClass}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="cp-skin">Cilt / saç tipi</Label>
            <textarea
              id="cp-skin"
              rows={2}
              value={skinHairType}
              onChange={(e) => setSkinHairType(e.target.value)}
              disabled={pending}
              className={textareaClass}
              placeholder="Örn. yağlı cilt, kuru saç…"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Onaylar</CardTitle>
          <CardDescription>Hizmet ve iletişim süreçleri için gerekli onaylar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-primary"
              checked={kvkkConsent}
              onChange={(e) => setKvkkConsent(e.target.checked)}
              disabled={pending}
              required
            />
            <span className="text-sm leading-relaxed">
              <strong>KVKK Aydınlatma Metni Onayı</strong> — Kişisel verilerin işlenmesi için (zorunlu).
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-primary"
              checked={commercialConsent}
              onChange={(e) => setCommercialConsent(e.target.checked)}
              disabled={pending}
            />
            <span className="text-sm leading-relaxed">
              <strong>Ticari Elektronik İleti Onayı (İYS)</strong> — SMS, WhatsApp ve e-posta üzerinden kampanya
              mesajları almak istiyorum.
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-primary"
              checked={serviceRiskConsent}
              onChange={(e) => setServiceRiskConsent(e.target.checked)}
              disabled={pending}
            />
            <span className="text-sm leading-relaxed">
              <strong>Hizmet öncesi onay formları</strong> — Özellikle güzellik merkezleri için işlem risklerini
              okudum ve anladım.
            </span>
          </label>
        </CardContent>
        <CardFooter className={cn("flex-col items-start gap-2 sm:flex-row sm:items-center")}>
          <Button type="submit" disabled={pending}>
            {pending ? "Kaydediliyor…" : "Profili kaydet"}
          </Button>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        </CardFooter>
      </Card>

      {showLinkedSalons && initial.linkedSalons.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Bağlı işletmeler</CardTitle>
            <CardDescription>
              Davet veya randevu ile hesabınıza bağlanan salonlar. Bilgileriniz hepsinde aynıdır.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {initial.linkedSalons.map((s) => (
                <li key={s.tenantId} className="rounded-md border px-3 py-2">
                  {s.tenantName}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </form>
  );
}
