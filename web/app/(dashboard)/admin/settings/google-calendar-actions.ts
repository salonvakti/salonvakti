"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/auth/session";
import { hasBooleanFeature, loadTenantFeaturesById } from "@/lib/features";
import {
  hasGoogleCalendarPackage,
  mergeGoogleCalendarIntoSettingsJson,
  parseGoogleCalendarFromSettingsJson,
  toPublicGoogleCalendarConfig,
  type GoogleCalendarTenantConfigPublic,
} from "@/lib/google/calendar-settings";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ResolvedTenantFeatures } from "@/types/features";

export type GoogleCalendarDashboardData = {
  features: ResolvedTenantFeatures;
  config: GoogleCalendarTenantConfigPublic;
  oauthConfigured: boolean;
};

async function requireBusinessAdmin() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false as const, error: "Oturum yapılandırması eksik." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, error: "Oturum yok." };
  }

  const profile = getSessionProfile(user);
  if (profile?.role !== "business_admin" || !profile.tenantId) {
    return { ok: false as const, error: "Bu işlem için işletme yöneticisi gerekli." };
  }

  return { ok: true as const, tenantId: profile.tenantId };
}

export async function getGoogleCalendarDashboardAction(): Promise<{
  ok: boolean;
  data: GoogleCalendarDashboardData | null;
  error: string | null;
}> {
  const gate = await requireBusinessAdmin();
  if (!gate.ok) {
    return { ok: false, data: null, error: gate.error };
  }

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return { ok: false, data: null, error: "Sunucu yapılandırması eksik." };
  }

  const [{ features }, { data: tenant }] = await Promise.all([
    loadTenantFeaturesById(admin, gate.tenantId),
    admin.from("tenants").select("settings_json").eq("id", gate.tenantId).maybeSingle(),
  ]);

  const config = parseGoogleCalendarFromSettingsJson(tenant?.settings_json);
  const oauthConfigured = Boolean(
    process.env.GOOGLE_CALENDAR_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET?.trim()
  );

  return {
    ok: true,
    data: {
      features,
      config: toPublicGoogleCalendarConfig(config),
      oauthConfigured,
    },
    error: null,
  };
}

export async function saveGoogleCalendarSettingsAction(input: {
  email: string;
  enabled: boolean;
}): Promise<{ ok: boolean; error: string | null }> {
  const gate = await requireBusinessAdmin();
  if (!gate.ok) {
    return { ok: false, error: gate.error };
  }

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return { ok: false, error: "Sunucu yapılandırması eksik." };
  }

  const { features } = await loadTenantFeaturesById(admin, gate.tenantId);
  if (!hasGoogleCalendarPackage(features)) {
    return { ok: false, error: "Google Takvim yalnızca Pro ve Ultimate paketlerde kullanılabilir." };
  }

  const email = input.email.trim();
  if (input.enabled && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Geçerli bir Google Takvim e-postası girin." };
  }

  const { data: tenant, error: tErr } = await admin
    .from("tenants")
    .select("settings_json")
    .eq("id", gate.tenantId)
    .maybeSingle();

  if (tErr || !tenant) {
    return { ok: false, error: tErr?.message ?? "İşletme kaydı bulunamadı." };
  }

  const previous = parseGoogleCalendarFromSettingsJson(tenant.settings_json);
  const merged = mergeGoogleCalendarIntoSettingsJson(
    tenant.settings_json,
    { email, enabled: input.enabled },
    previous
  );

  const { error: upErr } = await admin
    .from("tenants")
    .update({ settings_json: merged })
    .eq("id", gate.tenantId);

  if (upErr) {
    return { ok: false, error: upErr.message };
  }

  revalidatePath("/admin/settings");
  return { ok: true, error: null };
}

export async function disconnectGoogleCalendarAction(): Promise<{
  ok: boolean;
  error: string | null;
}> {
  const gate = await requireBusinessAdmin();
  if (!gate.ok) {
    return { ok: false, error: gate.error };
  }

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return { ok: false, error: "Sunucu yapılandırması eksik." };
  }

  const { features } = await loadTenantFeaturesById(admin, gate.tenantId);
  if (!hasBooleanFeature(features, "googleCalendarSync")) {
    return { ok: false, error: "Google Takvim yalnızca Pro ve Ultimate paketlerde kullanılabilir." };
  }

  const { data: tenant, error: tErr } = await admin
    .from("tenants")
    .select("settings_json")
    .eq("id", gate.tenantId)
    .maybeSingle();

  if (tErr || !tenant) {
    return { ok: false, error: tErr?.message ?? "İşletme kaydı bulunamadı." };
  }

  const previous = parseGoogleCalendarFromSettingsJson(tenant.settings_json);
  const merged = mergeGoogleCalendarIntoSettingsJson(
    tenant.settings_json,
    {
      email: previous?.email ?? "",
      enabled: previous?.enabled ?? false,
      oauth: null,
    },
    previous
  );

  const { error: upErr } = await admin
    .from("tenants")
    .update({ settings_json: merged })
    .eq("id", gate.tenantId);

  if (upErr) {
    return { ok: false, error: upErr.message };
  }

  revalidatePath("/admin/settings");
  return { ok: true, error: null };
}
