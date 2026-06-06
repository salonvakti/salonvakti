"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/auth/session";
import { isCustomerRole } from "@/lib/constants/roles";
import { addCustomerFavoriteTenant } from "@/lib/customer/favorite-salons";
import { buildDisplayName, parseNameParts } from "@/lib/customer/profile-names";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function acceptClientInviteAction(
  tokenRaw: string
): Promise<{ ok: boolean; error: string | null }> {
  const token = tokenRaw.trim();
  if (!token) {
    return { ok: false, error: "Davet kodu eksik." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, error: "Oturum yapılandırması eksik." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Önce giriş yapmalısınız." };
  }

  const profile = getSessionProfile(user);
  if (!profile || !isCustomerRole(profile.role)) {
    return { ok: false, error: "Daveti yalnızca müşteri hesabıyla kabul edebilirsiniz." };
  }

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return { ok: false, error: "Sunucu yapılandırması eksik." };
  }

  const { data: clientRow, error: cErr } = await admin
    .from("clients")
    .select("id,user_id,invite_expires_at,tenant_id")
    .eq("invite_token", token)
    .maybeSingle();

  if (cErr || !clientRow) {
    return { ok: false, error: "Davet bulunamadı veya geçersiz." };
  }

  if (clientRow.user_id) {
    return { ok: false, error: "Bu davet zaten kullanılmış." };
  }

  const exp = clientRow.invite_expires_at as string | null;
  if (exp && new Date(exp).getTime() < Date.now()) {
    return { ok: false, error: "Davet süresi dolmuş." };
  }

  const meta = user.user_metadata ?? {};
  const { firstName, lastName } = parseNameParts(meta);
  const displayName = buildDisplayName(firstName, lastName);
  const phone = typeof meta.phone === "string" && meta.phone.trim() ? meta.phone.trim() : null;

  const clientPatch: Record<string, unknown> = {
    user_id: user.id,
    invite_token: null,
    invite_expires_at: null,
  };
  if (displayName) clientPatch.name = displayName;
  if (phone) clientPatch.phone = phone;
  if (user.email) clientPatch.email = user.email;

  const { error: uErr } = await admin
    .from("clients")
    .update(clientPatch)
    .eq("id", clientRow.id as string);

  if (uErr) {
    return { ok: false, error: uErr.message };
  }

  await addCustomerFavoriteTenant(user.id, clientRow.tenant_id as string);

  revalidatePath("/client/my-bookings");
  revalidatePath("/client/my-profile");
  revalidatePath("/client/favorite-salons");
  revalidatePath("/admin/clients");

  return { ok: true, error: null };
}
