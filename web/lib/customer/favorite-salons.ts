import "server-only";

import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";

export type CustomerFavoriteSalon = {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  favoritedAt: string;
};

export async function addCustomerFavoriteTenant(
  userId: string,
  tenantId: string
): Promise<void> {
  const admin = createServiceRoleSupabaseClient();
  if (!admin) return;

  await admin.from("customer_favorite_tenants").upsert(
    { user_id: userId, tenant_id: tenantId },
    { onConflict: "user_id,tenant_id", ignoreDuplicates: true }
  );
}

export async function listCustomerFavoriteSalons(userId: string): Promise<CustomerFavoriteSalon[]> {
  const admin = createServiceRoleSupabaseClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("customer_favorite_tenants")
    .select("tenant_id,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data?.length) return [];

  const tenantIds = data.map((r) => r.tenant_id as string);
  const { data: tenants } = await admin
    .from("tenants")
    .select("id,name,slug")
    .in("id", tenantIds);

  const byId = new Map(
    (tenants ?? []).map((t) => [
      t.id as string,
      { name: (t.name as string) ?? "İşletme", slug: (t.slug as string) ?? "" },
    ])
  );

  return data.map((row) => {
    const t = byId.get(row.tenant_id as string);
    return {
      tenantId: row.tenant_id as string,
      tenantName: t?.name ?? "İşletme",
      tenantSlug: t?.slug ?? "",
      favoritedAt: row.created_at as string,
    };
  });
}
