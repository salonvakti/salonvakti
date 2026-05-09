import type { User } from "@supabase/supabase-js";
import type { UserRole } from "@/lib/constants/roles";
import { USER_ROLES } from "@/lib/constants/roles";

export type SessionProfile = {
  role: UserRole;
  tenantId: string | null;
  /** business_user için randevu filtresi; user_metadata.staff_id */
  staffId: string | null;
};

function parseRole(raw: unknown): UserRole {
  if (typeof raw === "string" && (USER_ROLES as readonly string[]).includes(raw)) {
    return raw as UserRole;
  }
  return "customer";
}

/** Supabase kullanıcı metadata'sından rol ve tenant okur */
export function getSessionProfile(user: User | null): SessionProfile | null {
  if (!user) return null;
  const meta = user.user_metadata ?? {};
  return {
    role: parseRole(meta.role),
    tenantId: typeof meta.tenant_id === "string" ? meta.tenant_id : null,
    staffId: typeof meta.staff_id === "string" ? meta.staff_id : null,
  };
}
