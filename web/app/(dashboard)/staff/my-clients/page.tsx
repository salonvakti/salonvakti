"use client";

import { useEffect, useMemo, useState } from "react";
import { useSupabaseContext } from "@/components/providers/supabase-provider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
};

function formatLastVisit(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function StaffMyClientsPage() {
  const { client, profile, session } = useSupabaseContext();
  const [resolvedStaffId, setResolvedStaffId] = useState<string | null>(null);
  const [staffLookupDone, setStaffLookupDone] = useState(false);
  const [rows, setRows] = useState<(ClientListRow & { lastAppointmentAt: string | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;

    async function resolveStaff() {
      setStaffLookupDone(false);
      if (!client || !profile?.tenantId) {
        if (active) {
          setResolvedStaffId(null);
          setStaffLookupDone(true);
        }
        return;
      }
      if (profile.role === "business_admin") {
        if (active) {
          setResolvedStaffId("__all__");
          setStaffLookupDone(true);
        }
        return;
      }
      if (profile.role !== "business_user") {
        if (active) {
          setResolvedStaffId(null);
          setStaffLookupDone(true);
        }
        return;
      }
      if (profile.staffId) {
        if (active) {
          setResolvedStaffId(profile.staffId);
          setStaffLookupDone(true);
        }
        return;
      }
      const uid = session?.user?.id;
      if (!uid) {
        if (active) {
          setResolvedStaffId(null);
          setStaffLookupDone(true);
        }
        return;
      }
      const { data } = await client
        .from("staff")
        .select("id")
        .eq("tenant_id", profile.tenantId)
        .eq("user_id", uid)
        .maybeSingle();
      if (active) {
        setResolvedStaffId((data?.id as string | undefined) ?? null);
        setStaffLookupDone(true);
      }
    }

    void resolveStaff();
    return () => {
      active = false;
    };
  }, [client, profile?.tenantId, profile?.role, profile?.staffId, session?.user?.id]);

  useEffect(() => {
    let active = true;

    async function load() {
      setError(null);
      if (!client || !staffLookupDone) {
        return;
      }

      if (!profile?.tenantId) {
        if (active) {
          setLoading(false);
          setRows([]);
          setError("İşletme bilgisi bulunamadı (tenant_id eksik).");
        }
        return;
      }

      if (!resolvedStaffId) {
        if (active) {
          setLoading(false);
          setRows([]);
          setError(
            profile.role === "business_user"
              ? "Personel kaydı bulunamadı; müşteri listesi için staff bağlantısı gerekir."
              : "Bu hesap için müşteri listesi açılamıyor."
          );
        }
        return;
      }

      setLoading(true);

      let clientIds: string[] = [];
      const lastByClient = new Map<string, string>();

      if (resolvedStaffId !== "__all__") {
        const { data: appts, error: apptErr } = await client
          .from("appointments")
          .select("client_id,start_time")
          .eq("tenant_id", profile.tenantId)
          .eq("staff_id", resolvedStaffId)
          .order("start_time", { ascending: false });

        if (!active) return;

        if (apptErr) {
          setError(`Randevular yüklenemedi: ${apptErr.message}`);
          setRows([]);
          setLoading(false);
          return;
        }

        for (const row of appts ?? []) {
          const cid = row.client_id as string | null;
          const st = row.start_time as string | null;
          if (!cid || !st) continue;
          if (!lastByClient.has(cid)) lastByClient.set(cid, st);
        }
        clientIds = Array.from(lastByClient.keys());

        if (clientIds.length === 0) {
          setRows([]);
          setLoading(false);
          return;
        }
      }

      let q = client
        .from("clients")
        .select("id,name,phone,email,user_id,business_approved_at,phone_verified_at")
        .eq("tenant_id", profile.tenantId)
        .order("created_at", { ascending: false });

      if (resolvedStaffId !== "__all__") {
        q = q.in("id", clientIds);
      }

      const { data, error: fetchError } = await q;

      if (!active) return;

      if (fetchError) {
        setError(`Müşteriler yüklenemedi: ${fetchError.message}`);
        setRows([]);
      } else {
        const list = (data ?? []) as ClientListRow[];
        const merged = list.map((c) => ({
          ...c,
          lastAppointmentAt: lastByClient.get(c.id) ?? null,
        }));
        setRows(merged);
      }
      setLoading(false);
    }

    void load();
    return () => {
      active = false;
    };
  }, [client, profile?.tenantId, profile?.role, resolvedStaffId, staffLookupDone]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((c) => {
      const hay = `${c.name} ${c.phone ?? ""} ${c.email ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Müşterilerim</h1>
          <p className="text-muted-foreground">
            {resolvedStaffId === "__all__"
              ? "İşletmenizdeki tüm müşteriler. İşletme onaylı (yeşil), telefon onaylı (sarı), yalnızca platform kaydı (turuncu)."
              : "Sizinle randevusu olan müşteriler. İşletme onaylı (yeşil), telefon onaylı (sarı), yalnızca platform kaydı (turuncu)."}
          </p>
        </div>
        <Input
          placeholder="İsim veya telefon ara"
          className="md:w-64"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Yükleniyor...</p> : null}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Durum</TableHead>
              <TableHead>İsim</TableHead>
              <TableHead>Son randevu</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>E-posta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => {
              const tier = getClientDisplayTier(c);
              const meta = clientTierMeta[tier];
              return (
                <TableRow key={c.id} className={cn(meta.rowClass)}>
                  <TableCell>
                    <Badge className={meta.badgeClass}>{meta.label}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {resolvedStaffId === "__all__" ? "—" : formatLastVisit(c.lastAppointmentAt)}
                  </TableCell>
                  <TableCell>{c.phone ?? "—"}</TableCell>
                  <TableCell>{c.email ?? "—"}</TableCell>
                </TableRow>
              );
            })}
            {!loading && filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                  {resolvedStaffId !== "__all__"
                    ? "Bu personel için kayıtlı randevu / müşteri yok veya arama sonucu boş."
                    : "Müşteri yok veya arama sonucu boş."}
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
