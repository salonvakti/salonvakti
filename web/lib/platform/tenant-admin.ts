import type { TenantRow } from "@/lib/db-types";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";

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

export async function updateTenantLicenseFields(
  tenantId: string,
  fields: {
    license_plan: string | null;
    license_start_at: string | null;
    license_end_at: string | null;
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
      license_plan: fields.license_plan,
      license_start_at: fields.license_start_at,
      license_end_at: fields.license_end_at,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tenantId);

  if (error) return { error: error.message };
  return { error: null };
}
