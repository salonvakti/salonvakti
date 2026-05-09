"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { createTenantAction, updateTenantPlatformAction } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TenantRow, TenantStatus } from "@/lib/db-types";
import { normalizeTenantSlug } from "@/lib/tenant/slug";
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
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editStatus, setEditStatus] = useState<TenantStatus>("active");
  const [plan, setPlan] = useState("");
  const [startLocal, setStartLocal] = useState("");
  const [endLocal, setEndLocal] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newPlan, setNewPlan] = useState("");
  const [newStartLocal, setNewStartLocal] = useState("");
  const [newEndLocal, setNewEndLocal] = useState("");
  const [newStatus, setNewStatus] = useState<TenantStatus>("active");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [pending, startTransition] = useTransition();

  const editingTenant = useMemo(
    () => tenants.find((t) => t.id === editingId) ?? null,
    [tenants, editingId]
  );

  function openEdit(t: TenantRow) {
    setEditingId(t.id);
    setEditName(t.name);
    setEditSlug(t.slug);
    setEditStatus(t.status);
    setPlan(t.license_plan ?? "");
    setStartLocal(toDatetimeLocalValue(t.license_start_at));
    setEndLocal(toDatetimeLocalValue(t.license_end_at));
    setShowCreate(false);
  }

  function saveEdit() {
    if (!editingId) return;
    startTransition(async () => {
      const result = await updateTenantPlatformAction({
        tenantId: editingId,
        name: editName,
        slugRaw: editSlug,
        licensePlan: plan.trim() || null,
        licenseStartAtIso: fromDatetimeLocalValue(startLocal),
        licenseEndAtIso: fromDatetimeLocalValue(endLocal),
        status: editStatus,
      });
      if (!result.ok && result.error) {
        window.alert(result.error);
        return;
      }
      setEditingId(null);
      router.refresh();
    });
  }

  function saveCreate() {
    startTransition(async () => {
      const result = await createTenantAction({
        name: newName,
        slugRaw: newSlug,
        licensePlan: newPlan.trim() || null,
        licenseStartAtIso: fromDatetimeLocalValue(newStartLocal),
        licenseEndAtIso: fromDatetimeLocalValue(newEndLocal),
        phone: newPhone.trim() || null,
        address: newAddress.trim() || null,
        status: newStatus,
        adminEmail: newAdminEmail,
        adminPassword: newAdminPassword,
      });
      if (!result.ok && result.error) {
        window.alert(result.error);
        return;
      }
      setShowCreate(false);
      setNewName("");
      setNewSlug("");
      setNewPhone("");
      setNewAddress("");
      setNewPlan("");
      setNewStartLocal("");
      setNewEndLocal("");
      setNewStatus("active");
      setNewAdminEmail("");
      setNewAdminPassword("");
      router.refresh();
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
      {canManage ? (
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant={showCreate ? "secondary" : "default"}
            onClick={() => {
              setShowCreate((v) => !v);
              setEditingId(null);
            }}
          >
            {showCreate ? "Formu kapat" : "Yeni işletme"}
          </Button>
        </div>
      ) : null}

      {canManage && showCreate ? (
        <div className="space-y-4 rounded-lg border bg-card p-4">
          <h2 className="text-lg font-semibold">Yeni işletme</h2>
          <p className="text-sm text-muted-foreground">
            İşletme kaydı oluşturulur ve aynı anda bir <strong>işletme yöneticisi</strong> hesabı
            açılır (<code className="rounded bg-muted px-1 text-xs">business_admin</code>,{" "}
            <code className="rounded bg-muted px-1 text-xs">tenant_id</code> atanır). Yönetici{" "}
            <span className="font-medium">/login</span> ile giriş yapabilir.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <p className="text-sm font-medium">İşletme yöneticisi</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nt-admin-email">Yönetici e-postası</Label>
              <Input
                id="nt-admin-email"
                type="email"
                autoComplete="off"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                disabled={pending}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nt-admin-pass">Yönetici şifresi</Label>
              <Input
                id="nt-admin-pass"
                type="password"
                autoComplete="new-password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                disabled={pending}
                minLength={6}
                required
              />
              <p className="text-xs text-muted-foreground">En az 6 karakter.</p>
            </div>
            <div className="space-y-2 sm:col-span-2 border-t pt-4">
              <p className="text-sm font-medium">İşletme bilgisi</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nt-name">İşletme adı</Label>
              <Input
                id="nt-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={pending}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nt-slug">Slug (randevu URL)</Label>
              <Input
                id="nt-slug"
                placeholder="ornek-salon"
                value={newSlug}
                onChange={(e) => setNewSlug(normalizeTenantSlug(e.target.value))}
                disabled={pending}
              />
              <p className="text-xs text-muted-foreground">
                Önizleme: /booking/{newSlug || "…"}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nt-phone">Telefon (isteğe bağlı)</Label>
              <Input
                id="nt-phone"
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nt-addr">Adres (isteğe bağlı)</Label>
              <Input
                id="nt-addr"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nt-status">Hesap durumu</Label>
              <select
                id="nt-status"
                className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as TenantStatus)}
                disabled={pending}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="nt-plan">Lisans plan etiketi</Label>
              <Input
                id="nt-plan"
                placeholder="örn. basic, pro"
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value)}
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nt-start">Lisans başlangıç</Label>
              <Input
                id="nt-start"
                type="datetime-local"
                value={newStartLocal}
                onChange={(e) => setNewStartLocal(e.target.value)}
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nt-end">Lisans bitiş</Label>
              <Input
                id="nt-end"
                type="datetime-local"
                value={newEndLocal}
                onChange={(e) => setNewEndLocal(e.target.value)}
                disabled={pending}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={() => void saveCreate()} disabled={pending}>
              {pending ? "Kaydediliyor..." : "İşletmeyi oluştur"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreate(false)}
              disabled={pending}
            >
              İptal
            </Button>
          </div>
        </div>
      ) : null}

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
                        Düzenle
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
          <h2 className="text-lg font-semibold">İşletme ve lisans — {editingTenant.name}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ed-name">İşletme adı</Label>
              <Input
                id="ed-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ed-slug">Slug</Label>
              <Input
                id="ed-slug"
                value={editSlug}
                onChange={(e) => setEditSlug(normalizeTenantSlug(e.target.value))}
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ed-status">Hesap durumu</Label>
              <select
                id="ed-status"
                className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as TenantStatus)}
                disabled={pending}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="lic-plan">Lisans plan etiketi</Label>
              <Input
                id="lic-plan"
                placeholder="örn. basic, pro"
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lic-start">Lisans başlangıç (yerel saat)</Label>
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
              <Label htmlFor="lic-end">Lisans bitiş (yerel saat)</Label>
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
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void saveEdit()} disabled={pending}>
              {pending ? "Kaydediliyor..." : "Kaydet"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setEditingId(null)} disabled={pending}>
              İptal
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
