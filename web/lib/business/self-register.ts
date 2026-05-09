import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import {
  createTenantRecord,
  deleteTenantById,
} from "@/lib/platform/tenant-admin";
import { normalizeTenantSlug } from "@/lib/tenant/slug";
import type { User } from "@supabase/supabase-js";

/** Kendi kendine kayıt olan işletmelere verilen deneme süresi (gün). */
export const SELF_REGISTER_TRIAL_DAYS = 10;

export function trialLicenseWindow(): { startIso: string; endIso: string } {
  const start = new Date();
  const end = new Date(
    start.getTime() + SELF_REGISTER_TRIAL_DAYS * 24 * 60 * 60 * 1000
  );
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

export async function registerNewBusiness(input: {
  businessName: string;
  slugRaw: string;
  email: string;
  password: string;
}): Promise<{ ok: boolean; error: string | null }> {
  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return {
      ok: false,
      error:
        "Sunucu yapılandırması eksik: SUPABASE_SERVICE_ROLE_KEY tanımlı olmalıdır.",
    };
  }

  const name = input.businessName.trim();
  const slug = normalizeTenantSlug(input.slugRaw);
  const email = input.email.trim().toLowerCase();

  if (!name) {
    return { ok: false, error: "İşletme adı gerekli." };
  }
  if (!slug || slug.length < 2) {
    return { ok: false, error: "Geçerli bir kısa adres (slug) girin." };
  }
  if (!email.includes("@")) {
    return { ok: false, error: "Geçerli bir e-posta girin." };
  }
  if (input.password.length < 6) {
    return { ok: false, error: "Şifre en az 6 karakter olmalıdır." };
  }

  const { data: slugTaken } = await admin
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (slugTaken) {
    return { ok: false, error: "Bu kısa adres zaten kullanılıyor. Başka bir slug deneyin." };
  }

  const { startIso, endIso } = trialLicenseWindow();

  const { tenant, error: tErr } = await createTenantRecord({
    name,
    slug,
    license_plan: "basic",
    license_start_at: startIso,
    license_end_at: endIso,
    phone: null,
    address: null,
    status: "active",
  });

  if (tErr || !tenant) {
    return { ok: false, error: tErr ?? "İşletme oluşturulamadı." };
  }

  const { error: uErr } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      role: "business_admin",
      tenant_id: tenant.id,
      business_name: name,
      tenant_slug: slug,
    },
  });

  if (uErr) {
    await deleteTenantById(tenant.id);
    return { ok: false, error: uErr.message };
  }

  return { ok: true, error: null };
}

/**
 * Eski kayıtlar: user_metadata'da tenant_id yok ama slug/isim varsa tenant oluşturur ve metadata günceller.
 */
export async function repairLegacyBusinessAdminTenant(
  user: User
): Promise<{ ok: boolean; error: string | null }> {
  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return {
      ok: false,
      error:
        "Sunucu yapılandırması eksik (SUPABASE_SERVICE_ROLE_KEY). Hesap tamamlanamadı.",
    };
  }

  const meta = { ...(user.user_metadata ?? {}) };
  if (meta.role !== "business_admin") {
    return { ok: true, error: null };
  }
  if (typeof meta.tenant_id === "string" && meta.tenant_id.length > 0) {
    return { ok: true, error: null };
  }

  const slugRaw =
    (typeof meta.tenant_slug === "string" && meta.tenant_slug) ||
    (typeof meta.slug === "string" && meta.slug) ||
    "";
  const businessName =
    (typeof meta.business_name === "string" && meta.business_name) ||
    (typeof meta.name === "string" && meta.name) ||
    "";

  const slug = normalizeTenantSlug(slugRaw);
  if (!slug || slug.length < 2 || !businessName.trim()) {
    return {
      ok: false,
      error:
        "Hesabınızda işletme bilgisi eksik. Lütfen destek ile iletişime geçin veya yeni hesap oluşturun.",
    };
  }

  const { data: slugRow } = await admin
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (slugRow) {
    return {
      ok: false,
      error:
        "Bu kısa adres başka bir kayıtla çakışıyor. Destek ile iletişime geçin.",
    };
  }

  const { startIso, endIso } = trialLicenseWindow();

  const { tenant, error: tErr } = await createTenantRecord({
    name: businessName.trim(),
    slug,
    license_plan: "basic",
    license_start_at: startIso,
    license_end_at: endIso,
    phone: null,
    address: null,
    status: "active",
  });

  if (tErr || !tenant) {
    return { ok: false, error: tErr ?? "İşletme oluşturulamadı." };
  }

  const { error: upErr } = await admin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...meta,
      tenant_id: tenant.id,
      tenant_slug: slug,
      business_name: businessName.trim(),
    },
  });

  if (upErr) {
    await deleteTenantById(tenant.id);
    return { ok: false, error: upErr.message };
  }

  return { ok: true, error: null };
}
