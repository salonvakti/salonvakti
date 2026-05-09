"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/auth/session";
import { updateAuthUserPlatformRole } from "@/lib/platform/platform-auth-users";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function updatePlatformUserRoleAction(
  userId: string,
  role: "platform_admin" | "platform_user"
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
    return { ok: false, error: "Bu işlem için yetkiniz yok." };
  }

  if (user.id === userId) {
    return { ok: false, error: "Kendi rolünüzü bu ekrandan değiştirmeyin." };
  }

  const { error } = await updateAuthUserPlatformRole(userId, role);
  if (error) {
    return { ok: false, error };
  }

  revalidatePath("/platform/users");
  return { ok: true, error: null };
}
