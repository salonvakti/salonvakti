"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/auth/session";
import { normalizePhoneDigits } from "@/lib/phone/normalize";
import { absoluteUrl } from "@/lib/seo/site-url";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const INVITE_DAYS = 14;

function inviteExpiryIso(): string {
  return new Date(Date.now() + INVITE_DAYS * 864e5).toISOString();
}

async function requireBusinessAdminTenant(): Promise<
  { ok: true; tenantId: string } | { ok: false; error: string }
> {
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
  if (profile?.role !== "business_admin" || !profile.tenantId) {
    return { ok: false, error: "Bu işlem için işletme yöneticisi olmalısınız." };
  }

  return { ok: true, tenantId: profile.tenantId };
}

export async function issueClientInviteAction(
  clientId: string
): Promise<{ ok: boolean; inviteUrl: string | null; error: string | null }> {
  const gate = await requireBusinessAdminTenant();
  if (!gate.ok) {
    return { ok: false, inviteUrl: null, error: gate.error };
  }

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return { ok: false, inviteUrl: null, error: "Sunucu yapılandırması eksik." };
  }

  const { data: row, error: rErr } = await admin
    .from("clients")
    .select("id,tenant_id,user_id")
    .eq("id", clientId)
    .maybeSingle();

  if (rErr || !row) {
    return { ok: false, inviteUrl: null, error: rErr?.message ?? "Müşteri bulunamadı." };
  }

  if ((row.tenant_id as string) !== gate.tenantId) {
    return { ok: false, inviteUrl: null, error: "Bu müşteri kaydına erişiminiz yok." };
  }

  if (row.user_id) {
    return { ok: false, inviteUrl: null, error: "Bu müşteri zaten bir hesaba bağlı." };
  }

  const token = randomUUID();

  const { error: uErr } = await admin
    .from("clients")
    .update({
      invite_token: token,
      invite_expires_at: inviteExpiryIso(),
    })
    .eq("id", clientId)
    .eq("tenant_id", gate.tenantId);

  if (uErr) {
    return { ok: false, inviteUrl: null, error: uErr.message };
  }

  revalidatePath("/admin/clients");

  return {
    ok: true,
    inviteUrl: absoluteUrl(`/davet/${encodeURIComponent(token)}`),
    error: null,
  };
}

export async function createInvitedClientAction(input: {
  name: string;
  phone: string;
  email: string | null;
}): Promise<{ ok: boolean; inviteUrl: string | null; error: string | null }> {
  const gate = await requireBusinessAdminTenant();
  if (!gate.ok) {
    return { ok: false, inviteUrl: null, error: gate.error };
  }

  const name = input.name.trim();
  const phoneRaw = input.phone.trim();
  const phoneDigits = normalizePhoneDigits(phoneRaw);
  if (!name) {
    return { ok: false, inviteUrl: null, error: "İsim gerekli." };
  }
  if (!phoneDigits || phoneDigits.length < 10) {
    return { ok: false, inviteUrl: null, error: "Geçerli bir telefon girin." };
  }

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return { ok: false, inviteUrl: null, error: "Sunucu yapılandırması eksik." };
  }

  const { data: existingRows } = await admin
    .from("clients")
    .select("id,phone")
    .eq("tenant_id", gate.tenantId);

  const duplicate = (existingRows ?? []).find(
    (c) => normalizePhoneDigits((c.phone as string | null) ?? "") === phoneDigits
  );

  if (duplicate) {
    return {
      ok: false,
      inviteUrl: null,
      error: "Bu telefonla zaten bir müşteri kaydı var. Satırdan davet oluşturun.",
    };
  }

  const token = randomUUID();

  const { data: inserted, error: insErr } = await admin
    .from("clients")
    .insert({
      tenant_id: gate.tenantId,
      name,
      phone: phoneRaw,
      email: input.email?.trim() || null,
      invite_token: token,
      invite_expires_at: inviteExpiryIso(),
    })
    .select("id")
    .single();

  if (insErr || !inserted) {
    return { ok: false, inviteUrl: null, error: insErr?.message ?? "Kayıt oluşturulamadı." };
  }

  revalidatePath("/admin/clients");

  return {
    ok: true,
    inviteUrl: absoluteUrl(`/davet/${encodeURIComponent(token)}`),
    error: null,
  };
}
