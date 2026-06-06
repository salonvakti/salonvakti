"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  sendTenantSmsAction,
  type SmsDashboardData,
} from "@/app/(dashboard)/admin/sms/actions";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FEATURE_UNLIMITED } from "@/lib/features";
import { hasSmsPackage } from "@/lib/sms/sms-quota-shared";
import { PLAN_LABELS } from "@/types/features";

const textareaClass =
  "flex min-h-[100px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminSmsClient({ initial }: { initial: SmsDashboardData }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const smsEnabled = hasSmsPackage(initial.features);
  const remainingLabel =
    initial.remaining === FEATURE_UNLIMITED
      ? "Sınırsız"
      : initial.remaining != null
        ? `${initial.remaining} kalan`
        : "—";

  function send(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await sendTenantSmsAction({ phone, message });
      if (!res.ok) {
        setError(res.error ?? "Gönderilemedi.");
        return;
      }
      setPhone("");
      setMessage("");
      setSuccess("SMS gönderildi.");
      router.refresh();
    });
  }

  if (!smsEnabled) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">SMS</h1>
        <Card>
          <CardHeader>
            <CardTitle>Pro veya Ultimate gerekli</CardTitle>
            <CardDescription>
              SMS gönderimi yalnızca Pro (aylık 500) ve Ultimate (sınırsız) paketlerde açıktır.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const configReady = initial.config.passwordSet && initial.config.usercode && initial.config.msgheader;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SMS</h1>
          <p className="text-muted-foreground">
            {PLAN_LABELS[initial.planType]} paketi · {initial.quotaLabel} · Bu ay gönderilen:{" "}
            {initial.sentThisMonth} ({remainingLabel})
          </p>
        </div>
        <Link href="/admin/settings" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Netgsm ayarları
        </Link>
      </div>

      {!configReady || !initial.config.enabled ? (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="py-4 text-sm">
            Netgsm API bilgileri eksik veya SMS devre dışı.{" "}
            <Link href="/admin/settings" className="font-medium text-primary underline-offset-2 hover:underline">
              Salon ayarları
            </Link>{" "}
            bölümünden yapılandırın.
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>SMS gönder</CardTitle>
          <CardDescription>
            Netgsm OTP SMS API kullanılır. Mesaj en fazla 160 karakter; numara 5XXXXXXXXX formatında olmalıdır.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={send} className="grid max-w-xl gap-4">
            <div className="space-y-2">
              <Label htmlFor="sms-phone">Alıcı telefon</Label>
              <Input
                id="sms-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XX XXX XX XX"
                required
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sms-msg">Mesaj</Label>
              <textarea
                id="sms-msg"
                rows={4}
                maxLength={160}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                disabled={pending}
                className={textareaClass}
                placeholder="Randevu hatırlatma veya bilgilendirme metni…"
              />
              <p className="text-xs text-muted-foreground">{message.length}/160</p>
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
            <Button type="submit" disabled={pending || !configReady || !initial.config.enabled}>
              {pending ? "Gönderiliyor…" : "SMS gönder"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gönderim geçmişi</CardTitle>
          <CardDescription>Son 100 kayıt</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {initial.logs.length === 0 ? (
            <p className="px-6 py-4 text-sm text-muted-foreground">Henüz SMS gönderilmedi.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Mesaj</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Netgsm</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initial.logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatDateTime(log.createdAt)}
                    </TableCell>
                    <TableCell>{log.recipientPhone}</TableCell>
                    <TableCell className="max-w-[240px] truncate text-sm" title={log.message}>
                      {log.message}
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.status === "sent" ? "default" : "destructive"}>
                        {log.status === "sent" ? "Gönderildi" : "Başarısız"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[180px] text-xs text-muted-foreground">
                      {log.netgsmJobId ? `Job: ${log.netgsmJobId}` : null}
                      {log.netgsmCode ? ` · Kod: ${log.netgsmCode}` : null}
                      {log.netgsmDescription ? (
                        <span className="block truncate" title={log.netgsmDescription}>
                          {log.netgsmDescription}
                        </span>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
