"use server";

import { revalidatePath } from "next/cache";
import { createStaffMemberWithAuthUser } from "@/lib/business/staff-members";
import { getSessionProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createStaffMemberAction(input: {
  displayName: string;
  teamRole: string | null;
  color: string | null;
  email: string;
  password: string;
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

  const name = input.displayName.trim();
  if (!name) {
    return { ok: false, error: "Görünen ad gerekli." };
  }
  if (input.password.length < 6) {
    return { ok: false, error: "Şifre en az 6 karakter olmalıdır." };
  }

  const { error } = await createStaffMemberWithAuthUser({
    tenantId: profile.tenantId,
    displayName: name,
    teamRole: input.teamRole,
    color: input.color,
    email: input.email,
    password: input.password,
  });

  if (error) {
    return { ok: false, error };
  }

  revalidatePath("/admin/staff");
  revalidatePath("/admin/appointments");
  return { ok: true, error: null };
}
