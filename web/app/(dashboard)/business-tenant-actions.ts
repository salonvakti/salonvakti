"use server";

import { repairLegacyBusinessAdminTenant } from "@/lib/business/self-register";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function repairBusinessTenantAction(): Promise<{
  ok: boolean;
  error: string | null;
}> {
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

  return repairLegacyBusinessAdminTenant(user);
}
