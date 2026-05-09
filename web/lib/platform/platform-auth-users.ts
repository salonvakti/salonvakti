import type { User } from "@supabase/supabase-js";
import { USER_ROLES, type UserRole } from "@/lib/constants/roles";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";

export type PlatformAuthUserRow = {
  id: string;
  email: string | null;
  role: UserRole;
  status: "active" | "pending" | "banned";
};

const PLATFORM_STAFF_ROLES = new Set<UserRole>(["platform_admin", "platform_user"]);

function parseUserRole(meta: User["user_metadata"]): UserRole | null {
  const raw = meta?.role;
  if (typeof raw === "string" && (USER_ROLES as readonly string[]).includes(raw)) {
    return raw as UserRole;
  }
  return null;
}

function userStatus(u: User): PlatformAuthUserRow["status"] {
  if (u.banned_until) return "banned";
  if (u.email_confirmed_at) return "active";
  return "pending";
}

export async function listPlatformStaffFromAuth(): Promise<{
  users: PlatformAuthUserRow[];
  error: string | null;
}> {
  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return {
      users: [],
      error:
        "Sunucu yapılandırması eksik: NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.",
    };
  }

  const collected: User[] = [];
  let page = 1;
  const perPage = 200;

  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      return { users: [], error: error.message };
    }
    const batch = data.users ?? [];
    collected.push(...batch);
    if (batch.length < perPage) break;
    page += 1;
  }

  const users: PlatformAuthUserRow[] = [];
  for (const u of collected) {
    const role = parseUserRole(u.user_metadata);
    if (!role || !PLATFORM_STAFF_ROLES.has(role)) continue;
    users.push({
      id: u.id,
      email: u.email ?? null,
      role,
      status: userStatus(u),
    });
  }

  users.sort((a, b) => (a.email ?? "").localeCompare(b.email ?? "", "tr"));

  return { users, error: null };
}

export async function updateAuthUserPlatformRole(
  userId: string,
  role: "platform_admin" | "platform_user"
): Promise<{ error: string | null }> {
  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return {
      error:
        "Sunucu yapılandırması eksik: NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.",
    };
  }

  const { data: existing, error: fetchErr } = await admin.auth.admin.getUserById(userId);
  if (fetchErr || !existing.user) {
    return { error: fetchErr?.message ?? "Kullanıcı bulunamadı." };
  }

  const currentMeta = existing.user.user_metadata ?? {};
  const { error: updateErr } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...currentMeta,
      role,
    },
  });

  if (updateErr) return { error: updateErr.message };
  return { error: null };
}
