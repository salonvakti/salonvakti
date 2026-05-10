"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/auth/session";
import type { TenantBranchRow } from "@/lib/db-types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function listBranchesForBusinessAction(): Promise<{
  rows: TenantBranchRow[];
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
    return { rows: [], error: "Bu işlem için işletme yöneticisi olmalısınız." };
  }

  const { data, error } = await supabase
    .from("tenant_branches")
    .select("*")
    .eq("tenant_id", profile.tenantId)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return { rows: [], error: error.message };
  }

  return { rows: (data ?? []) as TenantBranchRow[], error: null };
}

export async function createBranchAction(input: {
  name: string;
  address: string | null;
  phone: string | null;
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

  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: "Şube adı gerekli." };
  }

  const { data: lastRow } = await supabase
    .from("tenant_branches")
    .select("sort_order")
    .eq("tenant_id", profile.tenantId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextSort = (typeof lastRow?.sort_order === "number" ? lastRow.sort_order : -1) + 1;

  const { error } = await supabase.from("tenant_branches").insert({
    tenant_id: profile.tenantId,
    name,
    address: input.address?.trim() || null,
    phone: input.phone?.trim() || null,
    sort_order: nextSort,
    is_active: true,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/admin/staff");
  return { ok: true, error: null };
}

export async function updateBranchAction(input: {
  branchId: string;
  name?: string;
  address?: string | null;
  phone?: string | null;
  isActive?: boolean;
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

  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) {
    const n = input.name.trim();
    if (!n) {
      return { ok: false, error: "Şube adı boş olamaz." };
    }
    patch.name = n;
  }
  if (input.address !== undefined) {
    patch.address = input.address?.trim() || null;
  }
  if (input.phone !== undefined) {
    patch.phone = input.phone?.trim() || null;
  }
  if (input.isActive !== undefined) {
    patch.is_active = input.isActive;
  }

  if (Object.keys(patch).length === 0) {
    return { ok: true, error: null };
  }

  const { error } = await supabase
    .from("tenant_branches")
    .update(patch)
    .eq("id", input.branchId)
    .eq("tenant_id", profile.tenantId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/admin/staff");
  return { ok: true, error: null };
}

export async function deleteBranchAction(branchId: string): Promise<{ ok: boolean; error: string | null }> {
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

  const { error } = await supabase
    .from("tenant_branches")
    .delete()
    .eq("id", branchId)
    .eq("tenant_id", profile.tenantId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/admin/staff");
  return { ok: true, error: null };
}
