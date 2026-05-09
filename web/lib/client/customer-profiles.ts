import "server-only";

import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";

export type CustomerClientProfileRow = {
  clientId: string;
  tenantId: string;
  tenantName: string;
  name: string;
  phone: string | null;
  email: string | null;
};

export async function listCustomerClientProfiles(userId: string): Promise<CustomerClientProfileRow[]> {
  const admin = createServiceRoleSupabaseClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("clients")
    .select("id,name,phone,email,tenant_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data?.length) return [];

  const tenantIds = Array.from(new Set(data.map((r) => r.tenant_id as string)));
  const { data: tenants } = await admin.from("tenants").select("id,name").in("id", tenantIds);

  const nameByTenant = new Map<string, string>(
    (tenants ?? []).map((t) => [t.id as string, (t.name as string) ?? "İşletme"])
  );

  return data.map((row) => ({
    clientId: row.id as string,
    tenantId: row.tenant_id as string,
    tenantName: nameByTenant.get(row.tenant_id as string) ?? "İşletme",
    name: row.name as string,
    phone: (row.phone as string | null) ?? null,
    email: (row.email as string | null) ?? null,
  }));
}
