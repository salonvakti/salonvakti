"use client";

import { useSupabaseContext } from "@/components/providers/supabase-provider";
import type { UserRole } from "@/lib/constants/roles";

/** İstemci bileşenlerinde oturum profilinden rol okur. */
export function useUserRole(): UserRole | null {
  const { profile } = useSupabaseContext();
  return profile?.role ?? null;
}
