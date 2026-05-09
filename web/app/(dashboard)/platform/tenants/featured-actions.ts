"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/auth/session";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function upsertFeaturedTenantAction(input: {
  tenantId: string;
  sortOrder: number;
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

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return { ok: false, error: "Sunucu yapılandırması eksik (service role)." };
  }

  const order = Number.isFinite(input.sortOrder) ? Math.floor(input.sortOrder) : 0;

  const { error } = await admin.from("platform_featured_tenants").upsert(
    {
      tenant_id: input.tenantId,
      sort_order: order,
    },
    { onConflict: "tenant_id" }
  );

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/platform/tenants");
  revalidatePath("/isletmeler");
  return { ok: true, error: null };
}

export async function removeFeaturedTenantAction(
  tenantId: string
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

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return { ok: false, error: "Sunucu yapılandırması eksik (service role)." };
  }

  const { error } = await admin.from("platform_featured_tenants").delete().eq("tenant_id", tenantId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/platform/tenants");
  revalidatePath("/isletmeler");
  return { ok: true, error: null };
}
