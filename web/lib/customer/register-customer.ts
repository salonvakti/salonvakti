import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";

export async function registerCustomerUser(input: {
  email: string;
  password: string;
  displayName: string | null;
}): Promise<{ ok: boolean; error: string | null }> {
  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return {
      ok: false,
      error: "Sunucu yapılandırması eksik: SUPABASE_SERVICE_ROLE_KEY tanımlı olmalıdır.",
    };
  }

  const email = input.email.trim().toLowerCase();
  if (!email.includes("@")) {
    return { ok: false, error: "Geçerli bir e-posta girin." };
  }
  if (input.password.length < 6) {
    return { ok: false, error: "Şifre en az 6 karakter olmalıdır." };
  }

  const displayName = input.displayName?.trim() || null;

  const { error } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      role: "customer",
      display_name: displayName,
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, error: null };
}
