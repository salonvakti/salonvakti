"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { getBusinessTenantFeaturesAction } from "@/app/(dashboard)/admin/settings/features-actions";
import {
  approveClientBusinessAction,
  createInvitedClientAction,
  issueClientInviteAction,
} from "./actions";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { useSupabaseContext } from "@/components/providers/supabase-provider";
import { hasBooleanFeature } from "@/lib/features";
import { buildWhatsAppChatUrl } from "@/lib/whatsapp/whatsapp-chat-url";
import type { ResolvedTenantFeatures } from "@/types/features";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  CheckCircle2,
  Link2,
  Loader2,
  MessageSquare,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
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

async function buildLastAppointmentMap(
  supabase: SupabaseClient,
  tenantId: string
): Promise<Map<string, string>> {
  const { data } = await supabase
    .from("appointments")
    .select("client_id,start_time")
    .eq("tenant_id", tenantId)
    .order("start_time", { ascending: false });

  const map = new Map<string, string>();
  for (const row of data ?? []) {
    const clientId = row.client_id as string | null;
    const startTime = row.start_time as string | null;
    if (clientId && startTime && !map.has(clientId)) {
      map.set(clientId, startTime);
    }
  }
  return map;
}

function sortClientsByLastAppointment(
  clients: ClientListRow[],
  lastByClient: Map<string, string>
): ClientListRow[] {
  return [...clients].sort((a, b) => {
    const tsA = lastByClient.get(a.id) ? new Date(lastByClient.get(a.id)!).getTime() : 0;
    const tsB = lastByClient.get(b.id) ? new Date(lastByClient.get(b.id)!).getTime() : 0;
    if (tsB !== tsA) return tsB - tsA;
    return a.name.localeCompare(b.name, "tr");
  });
}

const clientActionIconClass = buttonVariants({ size: "icon-sm", variant: "outline" });

function ClientActionsLegend({ whatsappEnabled }: { whatsappEnabled: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <span className={cn(clientActionIconClass, "pointer-events-none size-6")}>
          <MessageSquare className="size-3" />
        </span>
        SMS
      </span>
      {whatsappEnabled ? (
        <span className="inline-flex items-center gap-1.5">
          <span
            className={cn(
              clientActionIconClass,
              "pointer-events-none size-6 text-[#25D366] border-[#25D366]/40"
            )}
          >
            <WhatsAppIcon className="size-3" />
          </span>
          WhatsApp
        </span>
      ) : null}
      <span className="inline-flex items-center gap-1.5">
        <span className={cn(clientActionIconClass, "pointer-events-none size-6")}>
          <Link2 className="size-3" />
        </span>
        Davet
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className={cn(clientActionIconClass, "pointer-events-none size-6")}>
          <ShieldCheck className="size-3" />
        </span>
        Onay
      </span>
    </div>
  );
}

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
  const [features, setFeatures] = useState<ResolvedTenantFeatures | null>(null);

  const whatsappEnabled =
    profile?.role === "business_admin" &&
    features != null &&
    hasBooleanFeature(features, "whatsappIntegration");

  useEffect(() => {
    void getBusinessTenantFeaturesAction().then((res) => {
      if (!res.error) setFeatures(res.features);
    });
  }, []);

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

      const [{ data, error: fetchError }, lastMap] = await Promise.all([
        client
          .from("clients")
          .select(
            "id,name,phone,email,user_id,business_approved_at,phone_verified_at,invite_token,invite_expires_at"
          )
          .eq("tenant_id", profile.tenantId),
        buildLastAppointmentMap(client, profile.tenantId),
      ]);

      if (!active) return;

      if (fetchError) {
        setError(`Müşteriler yüklenemedi: ${fetchError.message}`);
        setRows([]);
      } else {
        setRows(sortClientsByLastAppointment((data ?? []) as ClientListRow[], lastMap));
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
    setBusyId(clientId);
    setError(null);
    const result = await approveClientBusinessAction(clientId);

    if (!result.ok || !result.approvedAt) {
      setError(`Onay kaydedilemedi: ${result.error ?? "Bilinmeyen hata."}`);
    } else {
      setRows((prev) =>
        prev.map((r) =>
          r.id === clientId ? { ...r, business_approved_at: result.approvedAt } : r
        )
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
          const [{ data }, lastMap] = await Promise.all([
            client
              .from("clients")
              .select(
                "id,name,phone,email,user_id,business_approved_at,phone_verified_at,invite_token,invite_expires_at"
              )
              .eq("tenant_id", profile.tenantId),
            buildLastAppointmentMap(client, profile.tenantId),
          ]);
          setRows(sortClientsByLastAppointment((data ?? []) as ClientListRow[], lastMap));
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
          <p className="text-sm text-muted-foreground">
            En son randevuya göre sıralanır. İkonlarla SMS, WhatsApp, davet ve onay işlemleri.
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {(Object.entries(clientTierMeta) as [keyof typeof clientTierMeta, (typeof clientTierMeta)[keyof typeof clientTierMeta]][]).map(
              ([, meta]) => (
                <span key={meta.label} className="inline-flex items-center gap-1.5">
                  <span className={cn("size-2 rounded-full", meta.dotClass)} />
                  {meta.label}
                </span>
              )
            )}
          </div>
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

      {copiedId && copiedId !== "__new__" ? (
        <p className="text-sm text-emerald-700">Davet bağlantısı panoya kopyalandı.</p>
      ) : null}

      <div className="overflow-x-auto rounded-md border">
        <ClientActionsLegend whatsappEnabled={whatsappEnabled} />
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Müşteri</TableHead>
              <TableHead>İletişim</TableHead>
              <TableHead className="w-[148px] text-right">İşlemler</TableHead>
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
              const isBusy = busyId === c.id;
              const whatsappUrl = buildWhatsAppChatUrl(c.phone);

              return (
                <TableRow key={c.id} className={cn(meta.rowClass)}>
                  <TableCell className="w-8 pr-0">
                    <span
                      className={cn("inline-block size-2.5 rounded-full", meta.dotClass)}
                      title={meta.label}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-2">
                      <Link
                        href={`/admin/clients/${c.id}`}
                        className="truncate font-medium text-primary underline-offset-2 hover:underline"
                      >
                        {c.name}
                      </Link>
                      {c.user_id ? (
                        <span title="Hesap bağlı" aria-label="Hesap bağlı">
                          <UserCheck className="size-3.5 shrink-0 text-muted-foreground" />
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0 space-y-0.5 text-sm">
                      <p className="truncate tabular-nums">{c.phone ?? "—"}</p>
                      {c.email ? (
                        <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center justify-end gap-1">
                      {c.phone ? (
                        <Link
                          href={`/admin/sms?phone=${encodeURIComponent(c.phone)}`}
                          title="SMS gönder"
                          aria-label={`${c.name} — SMS gönder`}
                          className={clientActionIconClass}
                        >
                          <MessageSquare className="size-3.5" />
                        </Link>
                      ) : null}
                      {whatsappEnabled && whatsappUrl ? (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="WhatsApp ile yaz"
                          aria-label={`${c.name} ile WhatsApp`}
                          className={cn(
                            clientActionIconClass,
                            "text-[#25D366] hover:bg-[#25D366]/10 hover:text-[#25D366] border-[#25D366]/40"
                          )}
                        >
                          <WhatsAppIcon className="size-3.5" />
                        </a>
                      ) : null}
                      {!c.user_id ? (
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="outline"
                          disabled={isBusy}
                          title={
                            copiedId === c.id
                              ? "Davet bağlantısı kopyalandı"
                              : inviteActive
                                ? "Davet bağlantısı kopyala (aktif davet var)"
                                : "Davet bağlantısı kopyala"
                          }
                          aria-label={`${c.name} — davet bağlantısı`}
                          className={cn(
                            copiedId === c.id && "border-emerald-500/50 text-emerald-600",
                            inviteActive && copiedId !== c.id && "border-primary/50 text-primary"
                          )}
                          onClick={() => void copyInviteForRow(c.id)}
                        >
                          {isBusy ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Link2 className="size-3.5" />
                          )}
                        </Button>
                      ) : null}
                      {c.business_approved_at ? (
                        <span
                          className={cn(
                            clientActionIconClass,
                            "text-green-600 border-green-500/40 bg-green-500/5"
                          )}
                          title="İşletme onaylı"
                        >
                          <CheckCircle2 className="size-3.5" />
                        </span>
                      ) : (
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="outline"
                          disabled={isBusy}
                          title="İşletme onayı ver"
                          aria-label={`${c.name} — işletme onayı`}
                          onClick={() => void approveBusiness(c.id)}
                        >
                          {isBusy ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <ShieldCheck className="size-3.5" />
                          )}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {!loading && filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
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
