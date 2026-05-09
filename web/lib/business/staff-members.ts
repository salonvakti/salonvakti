import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";

/**
 * İşletme yöneticisi tarafından personel + giriş hesabı oluşturur.
 * Hata olursa kısmi kayıtlar geri alınır.
 */
export async function createStaffMemberWithAuthUser(input: {
  tenantId: string;
  displayName: string;
  teamRole: string | null;
  color: string | null;
  email: string;
  password: string;
}): Promise<{ error: string | null }> {
  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return {
      error:
        "Sunucu yapılandırması eksik: SUPABASE_SERVICE_ROLE_KEY gerekli.",
    };
  }

  const email = input.email.trim().toLowerCase();
  if (!email.includes("@")) {
    return { error: "Geçerli bir e-posta girin." };
  }

  const { data: staffRow, error: insErr } = await admin
    .from("staff")
    .insert({
      tenant_id: input.tenantId,
      display_name: input.displayName.trim(),
      team_role: input.teamRole?.trim() || null,
      color: input.color?.trim() || null,
      user_id: null,
    })
    .select("id")
    .single();

  if (insErr || !staffRow) {
    return { error: insErr?.message ?? "Personel kaydı oluşturulamadı." };
  }

  const staffId = staffRow.id as string;

  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      role: "business_user",
      tenant_id: input.tenantId,
      staff_id: staffId,
      display_name: input.displayName.trim(),
    },
  });

  if (authErr || !authData.user) {
    await admin.from("staff").delete().eq("id", staffId).eq("tenant_id", input.tenantId);
    return { error: authErr?.message ?? "Kullanıcı oluşturulamadı." };
  }

  const userId = authData.user.id;

  const { error: linkErr } = await admin
    .from("staff")
    .update({ user_id: userId })
    .eq("id", staffId)
    .eq("tenant_id", input.tenantId);

  if (linkErr) {
    await admin.auth.admin.deleteUser(userId);
    await admin.from("staff").delete().eq("id", staffId).eq("tenant_id", input.tenantId);
    return { error: linkErr.message };
  }

  return { error: null };
}
