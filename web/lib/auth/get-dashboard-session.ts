import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getSessionProfile, type SessionProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DashboardSession = {
  user: User;
  profile: SessionProfile | null;
};

/** Giriş yoksa yönlendirir; panel ve hesap düzenleri için ortak. */
export async function getDashboardSessionOrRedirect(): Promise<DashboardSession> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/login?error=config");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { user, profile: getSessionProfile(user) };
}
