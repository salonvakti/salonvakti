"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  createBranchAction,
  deleteBranchAction,
  listBranchesForBusinessAction,
  updateBranchAction,
} from "@/app/(dashboard)/admin/settings/branches-actions";
import type { TenantBranchRow } from "@/lib/db-types";
import { Button } from "@/components/ui/button";
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

export function BranchesSettingsSection() {
  const [rows, setRows] = useState<TenantBranchRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    setLoadError(null);
    const res = await listBranchesForBusinessAction();
    if (res.error) {
      setLoadError(res.error);
      setRows([]);
    } else {
      setRows(res.rows);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  function submitCreate() {
    startTransition(async () => {
      const res = await createBranchAction({
        name,
        address: address.trim() || null,
        phone: phone.trim() || null,
      });
      if (!res.ok && res.error) {
        window.alert(res.error);
        return;
      }
      setName("");
      setAddress("");
      setPhone("");
      await refresh();
    });
  }

  function toggleActive(row: TenantBranchRow) {
    startTransition(async () => {
      const res = await updateBranchAction({
        branchId: row.id,
        isActive: !row.is_active,
      });
      if (!res.ok && res.error) {
        window.alert(res.error);
        return;
      }
      await refresh();
    });
  }

  function removeRow(id: string) {
    if (!window.confirm("Bu şubeyi silmek istediğinize emin misiniz? İlgili personel ve eski randevu kayıtlarında şube alanı boşaltılır.")) {
      return;
    }
    startTransition(async () => {
      const res = await deleteBranchAction(id);
      if (!res.ok && res.error) {
        window.alert(res.error);
        return;
      }
      await refresh();
    });
  }

  return (
    <div className="space-y-6 rounded-lg border bg-card p-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Şubeler</h2>
        <p className="text-sm text-muted-foreground">
          En az bir aktif şube tanımladığınızda online randevu akışında müşteriler şube seçer. Personeli şubeye atamak
          için Personel sayfasını kullanın; şubesi olmayan personel tüm şubelerde listelenir.
        </p>
      </div>

      {loadError ? <p className="text-sm text-destructive">{loadError}</p> : null}

      <div className="space-y-4 rounded-md border bg-muted/20 p-4">
        <h3 className="text-sm font-medium">Yeni şube</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="br-name">Şube adı</Label>
            <Input
              id="br-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={pending || loading}
              placeholder="örn. Kadıköy"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="br-addr">Adres (isteğe bağlı)</Label>
            <Input
              id="br-addr"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={pending || loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="br-phone">Telefon (isteğe bağlı)</Label>
            <Input
              id="br-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={pending || loading}
            />
          </div>
        </div>
        <Button type="button" onClick={() => void submitCreate()} disabled={pending || loading || !name.trim()}>
          {pending ? "Ekleniyor…" : "Şube ekle"}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad</TableHead>
              <TableHead>Adres</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                  Yükleniyor…
                </TableCell>
              </TableRow>
            ) : null}
            {!loading &&
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-muted-foreground">{r.address ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{r.phone ?? "—"}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pending}
                      onClick={() => void toggleActive(r)}
                    >
                      {r.is_active ? "Aktif" : "Kapalı"}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={pending}
                      onClick={() => void removeRow(r.id)}
                    >
                      Sil
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            {!loading && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                  Henüz şube yok. Tek lokasyonlu işletmelerde online randevuda şube seçimi gösterilmez.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
