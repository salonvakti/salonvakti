import "server-only";

import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";

export type PublicBookingStaffMember = {
  id: string;
  displayName: string;
  branchId: string | null;
};

/**
 * Online randevu / vitrin için işletme personeli (service role; RLS istemci okumasını atlar).
 * Admin panelindeki listeyle aynı tenant filtresi kullanılır.
 */
export async function fetchPublicBookingStaff(tenantId: string): Promise<PublicBookingStaffMember[]> {
  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return [];
  }

  const { data, error } = await admin
    .from("staff")
    .select("id,display_name,branch_id")
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("[fetchPublicBookingStaff]", tenantId, error.message);
    return [];
  }

  const rows = (data ?? []) as { id: string; display_name: string; branch_id: string | null }[];
  rows.sort((a, b) =>
    (a.display_name ?? "").localeCompare(b.display_name ?? "", "tr", { sensitivity: "base" })
  );

  return rows.map((row) => ({
    id: row.id,
    displayName: row.display_name,
    branchId: row.branch_id,
  }));
}
