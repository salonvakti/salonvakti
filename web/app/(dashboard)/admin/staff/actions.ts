"use server";

import { revalidatePath } from "next/cache";
import { createStaffMemberWithAuthUser } from "@/lib/business/staff-members";
import { getSessionProfile } from "@/lib/auth/session";
import type { StaffRow } from "@/lib/db-types";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** İşletme yöneticisi paneli: RLS client SELECT başarısız olsa bile liste sunucudan gelir. */
export async function listStaffForAdminAction(): Promise<{
  rows: StaffRow[];
  error: string | null;
}> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { rows: [], error: "Oturum yapılandırması eksik." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { rows: [], error: "Oturum yok." };
  }

  const profile = getSessionProfile(user);
  if (profile?.role !== "business_admin" || !profile.tenantId) {
    return { rows: [], error: "Bu sayfa için işletme yöneticisi olmalısınız." };
  }

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return {
      rows: [],
      error: "Sunucu yapılandırması eksik: SUPABASE_SERVICE_ROLE_KEY gerekli.",
    };
  }

  const { data, error } = await admin
    .from("staff")
    .select("id,tenant_id,branch_id,user_id,display_name,team_role,color")
    .eq("tenant_id", profile.tenantId)
    .order("display_name", { ascending: true });

  if (error) {
    return { rows: [], error: error.message };
  }

  return { rows: (data ?? []) as StaffRow[], error: null };
}

export async function createStaffMemberAction(input: {
  displayName: string;
  teamRole: string | null;
  color: string | null;
  email: string;
  password: string;
  branchId: string | null;
}): Promise<{ ok: boolean; error: string | null }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, error: "Oturum yapılandırması eksik." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Oturum yok." };
  }

  const profile = getSessionProfile(user);
  if (profile?.role !== "business_admin" || !profile.tenantId) {
    return { ok: false, error: "Bu işlem için işletme yöneticisi olmalısınız." };
  }

  const name = input.displayName.trim();
  if (!name) {
    return { ok: false, error: "Görünen ad gerekli." };
  }
  if (input.password.length < 6) {
    return { ok: false, error: "Şifre en az 6 karakter olmalıdır." };
  }

  const { error } = await createStaffMemberWithAuthUser({
    tenantId: profile.tenantId,
    displayName: name,
    teamRole: input.teamRole,
    color: input.color,
    email: input.email,
    password: input.password,
    branchId: input.branchId?.trim() || null,
  });

  if (error) {
    return { ok: false, error };
  }

  revalidatePath("/admin/staff");
  revalidatePath("/admin/appointments");
  return { ok: true, error: null };
}

export async function updateStaffBranchAction(input: {
  staffId: string;
  branchId: string | null;
}): Promise<{ ok: boolean; error: string | null }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, error: "Oturum yapılandırması eksik." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Oturum yok." };
  }

  const profile = getSessionProfile(user);
  if (profile?.role !== "business_admin" || !profile.tenantId) {
    return { ok: false, error: "Bu işlem için işletme yöneticisi olmalısınız." };
  }

  const branchId = input.branchId?.trim() || null;

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return { ok: false, error: "Sunucu yapılandırması eksik." };
  }

  if (branchId) {
    const { data: br, error: bErr } = await admin
      .from("tenant_branches")
      .select("id")
      .eq("id", branchId)
      .eq("tenant_id", profile.tenantId)
      .maybeSingle();
    if (bErr || !br) {
      return { ok: false, error: bErr?.message ?? "Geçersiz şube." };
    }
  }

  const { error } = await admin
    .from("staff")
    .update({ branch_id: branchId })
    .eq("id", input.staffId)
    .eq("tenant_id", profile.tenantId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/staff");
  return { ok: true, error: null };
}
