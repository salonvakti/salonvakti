"use client";

import { useState } from "react";
import { StaffForm } from "@/components/forms/StaffForm";
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
  const [opened, setOpened] = useState("09:00");
  const [closed, setClosed] = useState("20:00");

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
            <Input id="salon-name" defaultValue="Demo Salon" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" type="tel" defaultValue="+90 212 000 00 00" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Adres</Label>
            <Input id="address" defaultValue="İstanbul" />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Kaydet</Button>
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
