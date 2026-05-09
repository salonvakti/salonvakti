"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateCustomerClientProfileAction } from "@/app/(dashboard)/client/profile-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CustomerClientProfileRow } from "@/lib/client/customer-profiles";

export function ClientProfilesClient({ initialRows }: { initialRows: CustomerClientProfileRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function save(row: CustomerClientProfileRow, form: FormData) {
    setError(null);
    setMessage(null);
    const name = String(form.get("name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim() || null;
    const email = String(form.get("email") ?? "").trim() || null;
    setBusyId(row.clientId);
    startTransition(async () => {
      const res = await updateCustomerClientProfileAction({
        clientId: row.clientId,
        name,
        phone,
        email,
      });
      setBusyId(null);
      if (!res.ok) {
        setError(res.error ?? "Kaydedilemedi.");
        return;
      }
      setMessage("Bilgileriniz güncellendi.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profilim</h1>
        <p className="text-muted-foreground">
          Randevu aldığınız işletmelerdeki müşteri kayıtlarınızı buradan güncelleyebilirsiniz. Her işletme için ayrı
          kayıt tutulur.
        </p>
      </div>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {initialRows.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Henüz bağlı kayıt yok</CardTitle>
            <CardDescription>
              Bir işletmede randevu aldığınızda veya davet ile hesabınızı bağladığınızda kayıtlarınız burada listelenir.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="space-y-6">
          {initialRows.map((row) => (
            <li key={row.clientId}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{row.tenantName}</CardTitle>
                  <CardDescription>Bu işletmedeki müşteri bilgileriniz</CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    className="grid gap-4 sm:grid-cols-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      save(row, new FormData(e.currentTarget));
                    }}
                  >
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor={`name-${row.clientId}`}>Ad soyad</Label>
                      <Input
                        id={`name-${row.clientId}`}
                        name="name"
                        defaultValue={row.name}
                        required
                        disabled={pending && busyId === row.clientId}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`phone-${row.clientId}`}>Telefon</Label>
                      <Input
                        id={`phone-${row.clientId}`}
                        name="phone"
                        type="tel"
                        defaultValue={row.phone ?? ""}
                        disabled={pending && busyId === row.clientId}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`email-${row.clientId}`}>E-posta</Label>
                      <Input
                        id={`email-${row.clientId}`}
                        name="email"
                        type="email"
                        defaultValue={row.email ?? ""}
                        disabled={pending && busyId === row.clientId}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Button type="submit" disabled={pending && busyId === row.clientId}>
                        {busyId === row.clientId && pending ? "Kaydediliyor…" : "Kaydet"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
