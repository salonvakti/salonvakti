"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/auth/session";
import { isCustomerRole } from "@/lib/constants/roles";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function updateCustomerClientProfileAction(input: {
  clientId: string;
  name: string;
  phone: string | null;
  email: string | null;
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
  if (!profile || !isCustomerRole(profile.role)) {
    return { ok: false, error: "Bu işlem yalnızca müşteri hesapları içindir." };
  }

  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: "İsim gerekli." };
  }

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return { ok: false, error: "Sunucu yapılandırması eksik." };
  }

  const { data: row, error: rErr } = await admin
    .from("clients")
    .select("id,user_id")
    .eq("id", input.clientId)
    .maybeSingle();

  if (rErr || !row) {
    return { ok: false, error: rErr?.message ?? "Kayıt bulunamadı." };
  }

  if ((row.user_id as string | null) !== user.id) {
    return { ok: false, error: "Bu kaydı güncelleyemezsiniz." };
  }

  const phone = input.phone?.trim() || null;
  const email = input.email?.trim() || null;

  const { error: uErr } = await admin
    .from("clients")
    .update({
      name,
      phone,
      email,
    })
    .eq("id", input.clientId)
    .eq("user_id", user.id);

  if (uErr) {
    return { ok: false, error: uErr.message };
  }

  revalidatePath("/client/my-profile");
  revalidatePath("/client/my-bookings");

  return { ok: true, error: null };
}
