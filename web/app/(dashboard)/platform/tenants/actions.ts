"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/auth/session";
import type { TenantStatus } from "@/lib/db-types";
import {
  createBusinessAdminAuthUser,
  createTenantRecord,
  deleteTenantById,
  updateTenantPlatformFields,
} from "@/lib/platform/tenant-admin";
import { normalizeTenantSlug } from "@/lib/tenant/slug";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createTenantAction(input: {
  name: string;
  slugRaw: string;
  licensePlan: string | null;
  licenseStartAtIso: string | null;
  licenseEndAtIso: string | null;
  phone: string | null;
  address: string | null;
  status: TenantStatus;
  adminEmail: string;
  adminPassword: string;
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
  if (profile?.role !== "platform_admin") {
    return { ok: false, error: "Bu işlem için platform yöneticisi olmalısınız." };
  }

  const name = input.name.trim();
  const slug = normalizeTenantSlug(input.slugRaw);
  if (!name) {
    return { ok: false, error: "İşletme adı gerekli." };
  }
  if (!slug || slug.length < 2) {
    return { ok: false, error: "Geçerli bir slug girin (en az 2 karakter, a-z 0-9 -)." };
  }

  const adminEmail = input.adminEmail.trim().toLowerCase();
  if (!adminEmail || !adminEmail.includes("@")) {
    return { ok: false, error: "İşletme yöneticisi için geçerli bir e-posta girin." };
  }
  if (input.adminPassword.length < 6) {
    return { ok: false, error: "Yönetici şifresi en az 6 karakter olmalıdır." };
  }

  const { tenant, error: tenantError } = await createTenantRecord({
    name,
    slug,
    license_plan: input.licensePlan?.trim() || null,
    license_start_at: input.licenseStartAtIso,
    license_end_at: input.licenseEndAtIso,
    phone: input.phone?.trim() || null,
    address: input.address?.trim() || null,
    status: input.status,
  });

  if (tenantError || !tenant) {
    return { ok: false, error: tenantError ?? "İşletme oluşturulamadı." };
  }

  const { error: authError } = await createBusinessAdminAuthUser({
    email: adminEmail,
    password: input.adminPassword,
    tenantId: tenant.id,
    businessName: name,
    tenantSlug: slug,
  });

  if (authError) {
    const { error: delErr } = await deleteTenantById(tenant.id);
    if (delErr) {
      return {
        ok: false,
        error: `${authError} Ayrıca oluşturulan işletme kaydı silinemedi (manuel temizlik: ${tenant.id}).`,
      };
    }
    return { ok: false, error: authError };
  }

  revalidatePath("/platform/tenants");
  return { ok: true, error: null };
}

export async function updateTenantPlatformAction(input: {
  tenantId: string;
  name: string;
  slugRaw: string;
  licensePlan: string | null;
  licenseStartAtIso: string | null;
  licenseEndAtIso: string | null;
  status: TenantStatus;
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
  if (profile?.role !== "platform_admin") {
    return { ok: false, error: "Bu işlem için platform yöneticisi olmalısınız." };
  }

  const name = input.name.trim();
  const slug = normalizeTenantSlug(input.slugRaw);
  if (!name) {
    return { ok: false, error: "İşletme adı gerekli." };
  }
  if (!slug || slug.length < 2) {
    return { ok: false, error: "Geçerli bir slug girin." };
  }

  const { error } = await updateTenantPlatformFields(input.tenantId, {
    name,
    slug,
    license_plan: input.licensePlan?.trim() || null,
    license_start_at: input.licenseStartAtIso,
    license_end_at: input.licenseEndAtIso,
    status: input.status,
  });

  if (error) {
    return { ok: false, error };
  }

  revalidatePath("/platform/tenants");
  revalidatePath("/admin/settings");
  return { ok: true, error: null };
}
