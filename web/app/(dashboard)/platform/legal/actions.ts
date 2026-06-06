"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/auth/session";
import { isPlatformStaffRole } from "@/lib/constants/roles";
import { DEFAULT_KVKK_TEXT } from "@/lib/platform/kvkk-default-text";
import { mergePublicSiteSettings } from "@/lib/platform/public-site-settings";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MAX_KVKK = 50000;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

type StaffGate =
  | { ok: true; admin: NonNullable<ReturnType<typeof createServiceRoleSupabaseClient>> }
  | { ok: false; error: string };

async function requirePlatformStaff(): Promise<StaffGate> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Oturum yapılandırması eksik." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = user ? getSessionProfile(user) : null;
  if (!user || !profile || !isPlatformStaffRole(profile.role)) {
    return { ok: false, error: "Bu işlem için platform kullanıcısı gerekli." };
  }

  const admin = createServiceRoleSupabaseClient();
  if (!admin) return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY tanımlı değil." };

  return { ok: true, admin };
}

export async function getPlatformLegalSettingsAction(): Promise<{
  kvkkText: string;
  error: string | null;
}> {
  const gate = await requirePlatformStaff();
  if (!gate.ok) {
    return { kvkkText: DEFAULT_KVKK_TEXT, error: gate.error };
  }

  const { data, error } = await gate.admin
    .from("platform_public_site_settings")
    .select("settings_json")
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    return { kvkkText: DEFAULT_KVKK_TEXT, error: error.message };
  }

  const settings = mergePublicSiteSettings((data as { settings_json: unknown } | null)?.settings_json);
  return { kvkkText: settings.legal.kvkkText, error: null };
}

export async function savePlatformKvkkTextAction(kvkkText: string): Promise<{
  ok: boolean;
  error: string | null;
}> {
  const gate = await requirePlatformStaff();
  if (!gate.ok) {
    return { ok: false, error: gate.error };
  }

  const text = kvkkText.trim().slice(0, MAX_KVKK);
  if (!text) {
    return { ok: false, error: "KVKK metni boş olamaz." };
  }

  const { data: row } = await gate.admin
    .from("platform_public_site_settings")
    .select("settings_json")
    .eq("id", "default")
    .maybeSingle();

  const prev = isRecord(row?.settings_json) ? row!.settings_json : {};
  const prevLegal = isRecord(prev.legal) ? { ...prev.legal } : {};

  const settings_json: Record<string, unknown> = {
    ...prev,
    legal: {
      ...prevLegal,
      kvkkText: text,
    },
  };

  const { error } = await gate.admin.from("platform_public_site_settings").upsert(
    {
      id: "default",
      settings_json,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/kvkk");
  revalidatePath("/platform/legal");
  revalidatePath("/client/my-profile");
  revalidatePath("/account");

  return { ok: true, error: null };
}
