"use client";

import { useState } from "react";
import { ServiceForm } from "@/components/forms/ServiceForm";
import { demoServices } from "@/lib/demo-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ServiceSummary } from "@/types/service";

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceSummary[]>(demoServices);

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hizmetler</h1>
          <p className="text-muted-foreground">Her hizmetin süresi ve fiyatı müşteri akışına yansır.</p>
        </div>
        <div className="grid gap-3">
          {services.map((s) => (
            <Card key={s.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{s.name}</CardTitle>
                <CardDescription>
                  {s.durationMinutes} dk ·{" "}
                  {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(s.price)}
                </CardDescription>
              </CardHeader>
              {s.description ? <CardContent className="text-sm text-muted-foreground">{s.description}</CardContent> : null}
            </Card>
          ))}
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Yeni hizmet</CardTitle>
          <CardDescription>Form kaydı Supabase tablosuna bağlanacak.</CardDescription>
        </CardHeader>
        <CardContent>
          <ServiceForm
            onSubmit={(data) => {
              setServices((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  name: data.name,
                  durationMinutes: data.durationMinutes,
                  price: data.price,
                  description: data.description || null,
                },
              ]);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
