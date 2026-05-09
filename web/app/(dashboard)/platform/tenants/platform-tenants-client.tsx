"use client";

import { useMemo, useState, useTransition } from "react";
import { updateTenantLicenseAction } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TenantRow } from "@/lib/db-types";
import { formatLicenseWindow, isTenantLicenseActive } from "@/lib/tenant/license";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(v: string): string | null {
  const t = v.trim();
  if (!t) return null;
  const d = new Date(t);
  if (!Number.isFinite(d.getTime())) return null;
  return d.toISOString();
}

type Props = {
  tenants: TenantRow[];
  canManage: boolean;
  configError: string | null;
};

export function PlatformTenantsClient({ tenants, canManage, configError }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [plan, setPlan] = useState("");
  const [startLocal, setStartLocal] = useState("");
  const [endLocal, setEndLocal] = useState("");
  const [pending, startTransition] = useTransition();

  const editingTenant = useMemo(
    () => tenants.find((t) => t.id === editingId) ?? null,
    [tenants, editingId]
  );

  function openEdit(t: TenantRow) {
    setEditingId(t.id);
    setPlan(t.license_plan ?? "");
    setStartLocal(toDatetimeLocalValue(t.license_start_at));
    setEndLocal(toDatetimeLocalValue(t.license_end_at));
  }

  function save() {
    if (!editingId) return;
    startTransition(async () => {
      const result = await updateTenantLicenseAction(
        editingId,
        plan.trim() || null,
        fromDatetimeLocalValue(startLocal),
        fromDatetimeLocalValue(endLocal)
      );
      if (!result.ok && result.error) {
        window.alert(result.error);
        return;
      }
      setEditingId(null);
    });
  }

  if (configError) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        {configError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>İşletme</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Lisans</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Tenant</TableHead>
              {canManage ? <TableHead className="text-right">İşlem</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((t) => {
              const lic = formatLicenseWindow(t.license_start_at, t.license_end_at);
              const licenseOk = isTenantLicenseActive({
                license_start_at: t.license_start_at,
                license_end_at: t.license_end_at,
              });
              return (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">{t.slug}</code>
                  </TableCell>
                  <TableCell>{t.license_plan ?? "—"}</TableCell>
                  <TableCell className="max-w-[220px] text-xs text-muted-foreground">
                    {lic.label}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant={t.status === "active" ? "default" : "secondary"}>
                        {t.status}
                      </Badge>
                      <Badge variant={licenseOk ? "outline" : "destructive"}>
                        {licenseOk ? "Lisans OK" : "Lisans dışı"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs text-muted-foreground">{t.id.slice(0, 8)}…</code>
                  </TableCell>
                  {canManage ? (
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => openEdit(t)}>
                        Lisans
                      </Button>
                    </TableCell>
                  ) : null}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {tenants.length === 0 ? (
        <p className="text-sm text-muted-foreground">Henüz işletme kaydı yok.</p>
      ) : null}

      {canManage && editingTenant ? (
        <div className="space-y-4 rounded-lg border bg-card p-4">
          <h2 className="text-lg font-semibold">Lisans — {editingTenant.name}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="lic-plan">Plan etiketi</Label>
              <Input
                id="lic-plan"
                placeholder="örn. basic, pro"
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lic-start">Başlangıç (yerel saat)</Label>
              <Input
                id="lic-start"
                type="datetime-local"
                value={startLocal}
                onChange={(e) => setStartLocal(e.target.value)}
                disabled={pending}
              />
              <p className="text-xs text-muted-foreground">Boş: başlangıç kısıtı yok.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lic-end">Bitiş (yerel saat)</Label>
              <Input
                id="lic-end"
                type="datetime-local"
                value={endLocal}
                onChange={(e) => setEndLocal(e.target.value)}
                disabled={pending}
              />
              <p className="text-xs text-muted-foreground">
                Boş: bitiş kısıtı yok. Geçmiş tarih işletme panelini kapatır.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => void save()} disabled={pending}>
              {pending ? "Kaydediliyor..." : "Kaydet"}
            </Button>
            <Button variant="outline" onClick={() => setEditingId(null)} disabled={pending}>
              İptal
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
