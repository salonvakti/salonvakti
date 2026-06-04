"use server";

import { getSessionProfile } from "@/lib/auth/session";
import { getTenantFeatures, loadTenantFeaturesById } from "@/lib/features";
import type { ResolvedTenantFeatures } from "@/types/features";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** İşletme paneli: oturumdaki kiracının birleşik özellik haritası */
export async function getBusinessTenantFeaturesAction(): Promise<{
  features: ResolvedTenantFeatures;
  error: string | null;
}> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { features: getTenantFeatures("basic"), error: "Oturum yapılandırması eksik." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { features: getTenantFeatures("basic"), error: "Oturum yok." };
  }

  const profile = getSessionProfile(user);
  if (!profile?.tenantId) {
    return { features: getTenantFeatures("basic"), error: "İşletme bağlamı yok." };
  }

  return loadTenantFeaturesById(supabase, profile.tenantId);
}
