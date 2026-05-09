import type { TenantRow, TenantStatus } from "@/lib/db-types";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";

export { normalizeTenantSlug } from "@/lib/tenant/slug";

export async function listTenantsForPlatform(): Promise<{
  tenants: TenantRow[];
  error: string | null;
}> {
  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return {
      tenants: [],
      error:
        "Sunucu yapılandırması eksik: SUPABASE_SERVICE_ROLE_KEY gerekli (işletme listesi).",
    };
  }

  const { data, error } = await admin
    .from("tenants")
    .select(
      "id,name,slug,logo_url,address,phone,status,license_plan,license_start_at,license_end_at,settings_json,created_at,updated_at"
    )
    .order("name", { ascending: true });

  if (error) {
    return { tenants: [], error: error.message };
  }

  return { tenants: (data ?? []) as TenantRow[], error: null };
}

export async function createTenantRecord(input: {
  name: string;
  slug: string;
  license_plan: string | null;
  license_start_at: string | null;
  license_end_at: string | null;
  phone: string | null;
  address: string | null;
  status: TenantStatus;
}): Promise<{ tenant: TenantRow | null; error: string | null }> {
  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return {
      tenant: null,
      error:
        "Sunucu yapılandırması eksik: SUPABASE_SERVICE_ROLE_KEY gerekli.",
    };
  }

  const now = new Date().toISOString();
  const { data, error } = await admin
    .from("tenants")
    .insert({
      name: input.name.trim(),
      slug: input.slug,
      status: input.status,
      license_plan: input.license_plan,
      license_start_at: input.license_start_at,
      license_end_at: input.license_end_at,
      phone: input.phone,
      address: input.address,
      updated_at: now,
    })
    .select(
      "id,name,slug,logo_url,address,phone,status,license_plan,license_start_at,license_end_at,settings_json,created_at,updated_at"
    )
    .single();

  if (error) {
    return { tenant: null, error: error.message };
  }
  return { tenant: data as TenantRow, error: null };
}

export async function deleteTenantById(tenantId: string): Promise<{ error: string | null }> {
  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return {
      error:
        "Sunucu yapılandırması eksik: SUPABASE_SERVICE_ROLE_KEY gerekli.",
    };
  }

  const { error } = await admin.from("tenants").delete().eq("id", tenantId);
  if (error) return { error: error.message };
  return { error: null };
}

export async function createBusinessAdminAuthUser(input: {
  email: string;
  password: string;
  tenantId: string;
  businessName: string;
  tenantSlug: string;
}): Promise<{ error: string | null }> {
  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return {
      error:
        "Sunucu yapılandırması eksik: SUPABASE_SERVICE_ROLE_KEY gerekli.",
    };
  }

  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { error: "Geçerli bir yönetici e-postası girin." };
  }

  const { error } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      role: "business_admin",
      tenant_id: input.tenantId,
      business_name: input.businessName.trim(),
      tenant_slug: input.tenantSlug,
    },
  });

  if (error) return { error: error.message };
  return { error: null };
}

export async function updateTenantPlatformFields(
  tenantId: string,
  fields: {
    name: string;
    slug: string;
    license_plan: string | null;
    license_start_at: string | null;
    license_end_at: string | null;
    status: TenantStatus;
  }
): Promise<{ error: string | null }> {
  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return {
      error:
        "Sunucu yapılandırması eksik: SUPABASE_SERVICE_ROLE_KEY gerekli.",
    };
  }

  const { error } = await admin
    .from("tenants")
    .update({
      name: fields.name.trim(),
      slug: fields.slug,
      status: fields.status,
      license_plan: fields.license_plan,
      license_start_at: fields.license_start_at,
      license_end_at: fields.license_end_at,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tenantId);

  if (error) return { error: error.message };
  return { error: null };
}
