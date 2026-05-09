"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/auth/session";
import { updateTenantLicenseFields } from "@/lib/platform/tenant-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function updateTenantLicenseAction(
  tenantId: string,
  licensePlan: string | null,
  licenseStartAtIso: string | null,
  licenseEndAtIso: string | null
): Promise<{ ok: boolean; error: string | null }> {
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

  const planTrimmed = licensePlan?.trim() || null;

  const { error } = await updateTenantLicenseFields(tenantId, {
    license_plan: planTrimmed,
    license_start_at: licenseStartAtIso,
    license_end_at: licenseEndAtIso,
  });

  if (error) {
    return { ok: false, error };
  }

  revalidatePath("/platform/tenants");
  return { ok: true, error: null };
}
