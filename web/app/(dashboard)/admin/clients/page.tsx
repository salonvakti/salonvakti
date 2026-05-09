"use client";

import { useEffect, useMemo, useState } from "react";
import { useSupabaseContext } from "@/components/providers/supabase-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type ClientListRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  user_id: string | null;
  business_approved_at: string | null;
  phone_verified_at: string | null;
};

type DisplayTier = "business_approved" | "phone_verified" | "platform_only";

function getDisplayTier(c: Pick<ClientListRow, "business_approved_at" | "phone_verified_at">): DisplayTier {
  if (c.business_approved_at) return "business_approved";
  if (c.phone_verified_at) return "phone_verified";
  return "platform_only";
}

const tierMeta: Record<
  DisplayTier,
  { label: string; badgeClass: string; rowClass: string }
> = {
  business_approved: {
    label: "İşletme onaylı",
    badgeClass: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    rowClass:
      "border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/15",
  },
  phone_verified: {
    label: "Telefon onaylı",
    badgeClass: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    rowClass:
      "border-l-4 border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/15",
  },
  platform_only: {
    label: "Platform kaydı",
    badgeClass: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
    rowClass:
      "border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/15",
  },
};

export default function AdminClientsPage() {
  const { client, profile } = useSupabaseContext();
  const [rows, setRows] = useState<ClientListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

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
        .select("id,name,phone,email,user_id,business_approved_at,phone_verified_at")
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Müşteriler</h1>
          <p className="text-muted-foreground">
            İşletme onaylı (yeşil), telefon onaylı (sarı), yalnızca platform kaydı (turuncu).
          </p>
        </div>
        <div className="flex w-full gap-2 md:w-auto">
          <Input
            placeholder="İsim veya telefon ara"
            className="md:w-64"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button type="button" variant="outline" disabled>
            Müşteri ekle (yakında)
          </Button>
        </div>
      </div>

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
              <TableHead className="text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => {
              const tier = getDisplayTier(c);
              const meta = tierMeta[tier];
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
                  <TableCell className="text-right">
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
                  </TableCell>
                </TableRow>
              );
            })}
            {!loading && filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
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
