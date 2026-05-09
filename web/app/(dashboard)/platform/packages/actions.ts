"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/auth/session";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function updateLandingPackagePricesAction(input: {
  basic: string;
  pro: string;
  ultimate: string;
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

  if (getSessionProfile(user)?.role !== "platform_admin") {
    return { ok: false, error: "Bu işlem için yetkiniz yok." };
  }

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY tanımlı değil." };
  }

  const rows = [
    { slug: "basic" as const, price_label: input.basic.trim() || "—" },
    { slug: "pro" as const, price_label: input.pro.trim() || "—" },
    { slug: "ultimate" as const, price_label: input.ultimate.trim() || "—" },
  ];

  const { error } = await admin.from("landing_package_prices").upsert(rows, {
    onConflict: "slug",
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/platform/packages");
  return { ok: true, error: null };
}
