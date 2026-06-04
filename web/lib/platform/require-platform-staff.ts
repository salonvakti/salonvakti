import { getSessionProfile } from "@/lib/auth/session";
import { isPlatformStaffRole } from "@/lib/constants/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PlatformStaffAuthResult =
  | { ok: true; userId: string; role: "platform_admin" | "platform_user" }
  | { ok: false; status: number; error: string };

/** Platform paneli API ve sunucu işlemleri için oturum doğrulama */
export async function requirePlatformStaff(): Promise<PlatformStaffAuthResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, status: 503, error: "Oturum yapılandırması eksik." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, status: 401, error: "Oturum gerekli." };
  }

  const profile = getSessionProfile(user);
  if (!profile || !isPlatformStaffRole(profile.role)) {
    return { ok: false, status: 403, error: "Bu işlem için platform yetkisi gerekli." };
  }

  return {
    ok: true,
    userId: user.id,
    role: profile.role as "platform_admin" | "platform_user",
  };
}
