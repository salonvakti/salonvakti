import "server-only";

import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";

export async function listFeaturedTenantOrders(): Promise<
  { tenantId: string; sortOrder: number }[]
> {
  const admin = createServiceRoleSupabaseClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("platform_featured_tenants")
    .select("tenant_id, sort_order")
    .order("sort_order", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    tenantId: row.tenant_id as string,
    sortOrder: row.sort_order as number,
  }));
}
