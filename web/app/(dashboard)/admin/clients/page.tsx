"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createInvitedClientAction, issueClientInviteAction } from "./actions";
import { useSupabaseContext } from "@/components/providers/supabase-provider";
import { Badge } from "@/components/ui/badge";
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
import {
  clientTierMeta,
  getClientDisplayTier,
} from "@/lib/clients/client-tier-display";
import { cn } from "@/lib/utils";

type ClientListRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  user_id: string | null;
  business_approved_at: string | null;
  phone_verified_at: string | null;
  invite_token: string | null;
  invite_expires_at: string | null;
};

export default function AdminClientsPage() {
  const { client, profile } = useSupabaseContext();
  const [rows, setRows] = useState<ClientListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteBusy, startInviteTransition] = useTransition();

  useEffect(() => {
    let active = true;

    async function load() {
      setError(null);
      if (!client || !profile?.tenantId) {
        if (active) {
          setLoading(false);
          setError("İşletme bilgisi bulunamadı (tenant_id eksik).");
        }
        return;
      }

      const { data, error: fetchError } = await client
        .from("clients")
        .select(
          "id,name,phone,email,user_id,business_approved_at,phone_verified_at,invite_token,invite_expires_at"
        )
        .eq("tenant_id", profile.tenantId)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (fetchError) {
        setError(`Müşteriler yüklenemedi: ${fetchError.message}`);
        setRows([]);
      } else {
        setRows((data ?? []) as ClientListRow[]);
      }
      setLoading(false);
    }

    void load();
    return () => {
      active = false;
    };
  }, [client, profile?.tenantId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((c) => {
      const hay = `${c.name} ${c.phone ?? ""} ${c.email ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, query]);

  async function approveBusiness(clientId: string) {
    if (!client || !profile?.tenantId) return;
    setBusyId(clientId);
    setError(null);
    const now = new Date().toISOString();
    const { error: upErr } = await client
      .from("clients")
      .update({ business_approved_at: now })
      .eq("id", clientId)
      .eq("tenant_id", profile.tenantId);

    if (upErr) {
      setError(`Onay kaydedilemedi: ${upErr.message}`);
    } else {
      setRows((prev) =>
        prev.map((r) => (r.id === clientId ? { ...r, business_approved_at: now } : r))
      );
    }
    setBusyId(null);
  }

  async function copyInviteForRow(clientId: string) {
    setBusyId(clientId);
    setError(null);
    setCopiedId(null);
    const result = await issueClientInviteAction(clientId);
    setBusyId(null);
    if (!result.ok || !result.inviteUrl) {
      setError(result.error ?? "Davet oluşturulamadı.");
      return;
    }
    try {
      await navigator.clipboard.writeText(result.inviteUrl);
      setCopiedId(clientId);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      setError("Panoya kopyalanamadı; bağlantıyı elle kopyalayın.");
    }
  }

  function submitNewInvite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startInviteTransition(async () => {
      const result = await createInvitedClientAction({
        name: inviteName,
        phone: invitePhone,
        email: inviteEmail.trim() || null,
      });
      if (!result.ok || !result.inviteUrl) {
        setError(result.error ?? "Davet oluşturulamadı.");
        return;
      }
      try {
        await navigator.clipboard.writeText(result.inviteUrl);
        setInviteName("");
        setInvitePhone("");
        setInviteEmail("");
        setShowInviteForm(false);
        setError(null);
        setCopiedId("__new__");
        setTimeout(() => setCopiedId(null), 2500);
        if (client && profile?.tenantId) {
          const { data } = await client
            .from("clients")
            .select(
              "id,name,phone,email,user_id,business_approved_at,phone_verified_at,invite_token,invite_expires_at"
            )
            .eq("tenant_id", profile.tenantId)
            .order("created_at", { ascending: false });
          setRows((data ?? []) as ClientListRow[]);
        }
      } catch {
        setError("Panoya kopyalanamadı.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Müşteriler</h1>
          <p className="text-muted-foreground">
            İşletme onaylı (yeşil), telefon onaylı (sarı), yalnızca platform kaydı (turuncu). Hesap bağlamak için
            davet bağlantısı gönderin — daha önce randevu alan kayıtlar da listede yer alır.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 md:w-auto">
          <Input
            placeholder="İsim veya telefon ara"
            className="md:w-64"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button type="button" variant="outline" onClick={() => setShowInviteForm((v) => !v)}>
            {showInviteForm ? "Formu kapat" : "Davet ile müşteri ekle"}
          </Button>
        </div>
      </div>

      {showInviteForm ? (
        <form
          onSubmit={submitNewInvite}
          className="space-y-4 rounded-lg border bg-card p-4 text-sm"
        >
          <h2 className="text-lg font-semibold">Yeni davet</h2>
          <p className="text-muted-foreground">
            Telefon numarası daha önce kayıtlıysa aşağıdaki tablodaki ilgili satırdan davet oluşturun.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="inv-name">Ad soyad</Label>
              <Input
                id="inv-name"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                required
                disabled={inviteBusy}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-phone">Telefon</Label>
              <Input
                id="inv-phone"
                type="tel"
                value={invitePhone}
                onChange={(e) => setInvitePhone(e.target.value)}
                required
                disabled={inviteBusy}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="inv-email">E-posta (isteğe bağlı)</Label>
              <Input
                id="inv-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={inviteBusy}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={inviteBusy}>
              {inviteBusy ? "Oluşturuluyor…" : "Davet oluştur ve panoya kopyala"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowInviteForm(false)} disabled={inviteBusy}>
              İptal
            </Button>
          </div>
        </form>
      ) : null}

      {copiedId === "__new__" ? (
        <p className="text-sm text-emerald-700">Davet bağlantısı panoya kopyalandı.</p>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Yükleniyor...</p> : null}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Durum</TableHead>
              <TableHead>İsim</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead>Hesap</TableHead>
              <TableHead>Davet</TableHead>
              <TableHead className="text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => {
              const tier = getClientDisplayTier(c);
              const meta = clientTierMeta[tier];
              const inviteActive =
                c.invite_token &&
                c.invite_expires_at &&
                new Date(c.invite_expires_at).getTime() > Date.now();
              return (
                <TableRow key={c.id} className={cn(meta.rowClass)}>
                  <TableCell>
                    <Badge className={meta.badgeClass}>{meta.label}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.phone ?? "—"}</TableCell>
                  <TableCell>{c.email ?? "—"}</TableCell>
                  <TableCell>
                    {c.user_id ? (
                      <span className="text-xs text-muted-foreground">Bağlı</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Yok</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[140px] text-xs text-muted-foreground">
                    {!c.user_id ? (
                      copiedId === c.id ? (
                        <span className="text-emerald-700">Panoya kopyalandı</span>
                      ) : inviteActive ? (
                        <span>Süre dolmadan yenileyebilirsiniz</span>
                      ) : (
                        <span>—</span>
                      )
                    ) : (
                      <span>—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      {!c.user_id ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={busyId === c.id}
                          onClick={() => void copyInviteForRow(c.id)}
                        >
                          {busyId === c.id ? "…" : "Davet bağlantısı"}
                        </Button>
                      ) : null}
                      {c.business_approved_at ? (
                        <span className="text-xs text-muted-foreground">Onaylı</span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyId === c.id}
                          onClick={() => void approveBusiness(c.id)}
                        >
                          {busyId === c.id ? "…" : "İşletme onayı"}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {!loading && filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                  Müşteri yok veya arama sonucu boş.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
