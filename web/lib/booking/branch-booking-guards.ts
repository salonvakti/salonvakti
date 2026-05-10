import "server-only";

import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";

export async function loadActiveBranchIdsForTenant(
  tenantId: string
): Promise<{ ids: string[]; error: string | null }> {
  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return { ids: [], error: null };
  }

  const { data, error } = await admin
    .from("tenant_branches")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("is_active", true);

  if (error) {
    return { ids: [], error: error.message };
  }

  return { ids: (data ?? []).map((r) => r.id as string), error: null };
}

export async function assertBranchAndStaffForBooking(input: {
  tenantId: string;
  staffId: string;
  branchId: string | null;
  activeBranchIds: string[];
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const hasBranches = input.activeBranchIds.length > 0;

  if (hasBranches) {
    if (!input.branchId || !input.activeBranchIds.includes(input.branchId)) {
      return { ok: false, error: "Geçerli bir şube seçin." };
    }
  } else if (input.branchId) {
    return { ok: false, error: "Bu işletme için şube seçimi geçerli değil." };
  }

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return { ok: false, error: "Sunucu yapılandırması eksik." };
  }

  const { data: st, error } = await admin
    .from("staff")
    .select("id,branch_id")
    .eq("id", input.staffId)
    .eq("tenant_id", input.tenantId)
    .maybeSingle();

  if (error || !st) {
    return { ok: false, error: "Personel geçersiz." };
  }

  const staffBranchId = st.branch_id as string | null;
  if (
    hasBranches &&
    input.branchId &&
    staffBranchId != null &&
    staffBranchId !== input.branchId
  ) {
    return { ok: false, error: "Seçilen personel bu şubede randevu vermiyor." };
  }

  return { ok: true };
}
