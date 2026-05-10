"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/auth/session";
import { PUBLIC_SITE_DEFAULT_COPY } from "@/lib/platform/public-site-defaults";
import { mergePublicSiteSettings } from "@/lib/platform/public-site-settings";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ResolvedPublicSiteSettings } from "@/types/public-site";

const URL_RE = /^https:\/\/.+/i;
const MAX_URL = 2048;
const MAX_SHORT = 120;
const MAX_LONG = 2000;

function cleanUrl(v: string | null | undefined): string | null {
  if (v == null || !String(v).trim()) return null;
  const s = String(v).trim().slice(0, MAX_URL);
  if (!URL_RE.test(s)) return null;
  return s;
}

function cleanColor(v: string | null | undefined): string | undefined {
  if (v == null || !String(v).trim()) return undefined;
  const s = String(v).trim().slice(0, 80);
  if (/^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/.test(s)) return s;
  if (/^oklch\(.+\)$/.test(s)) return s;
  if (/^rgb(a)?\(.+\)$/.test(s)) return s;
  return undefined;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export async function getPlatformSiteSettingsAdminAction(): Promise<{
  settings: ReturnType<typeof mergePublicSiteSettings>;
  error: string | null;
}> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { settings: mergePublicSiteSettings({}), error: "Oturum yapılandırması eksik." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || getSessionProfile(user)?.role !== "platform_admin") {
    return { settings: mergePublicSiteSettings({}), error: "Bu sayfa için platform yöneticisi gerekli." };
  }

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return { settings: mergePublicSiteSettings({}), error: "SUPABASE_SERVICE_ROLE_KEY tanımlı değil." };
  }

  const { data, error } = await admin
    .from("platform_public_site_settings")
    .select("settings_json")
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    return { settings: mergePublicSiteSettings({}), error: error.message };
  }

  return {
    settings: mergePublicSiteSettings((data as { settings_json: unknown } | null)?.settings_json),
    error: null,
  };
}

export async function savePlatformSiteSettingsAction(
  full: ResolvedPublicSiteSettings
): Promise<{ ok: boolean; error: string | null }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, error: "Oturum yapılandırması eksik." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || getSessionProfile(user)?.role !== "platform_admin") {
    return { ok: false, error: "Bu işlem için platform yöneticisi gerekli." };
  }

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY tanımlı değil." };
  }

  const { data: row } = await admin
    .from("platform_public_site_settings")
    .select("settings_json")
    .eq("id", "default")
    .maybeSingle();

  const prev = isRecord(row?.settings_json) ? row!.settings_json : {};
  const prevTheme = isRecord(prev.theme) ? { ...prev.theme } : {};
  const prevCopy = isRecord(prev.copy) ? { ...prev.copy } : {};
  const prevImages = isRecord(prev.images) ? { ...prev.images } : {};

  const nextTheme: Record<string, unknown> = { ...prevTheme };
  const pc = cleanColor(full.theme.primary);
  if (pc) nextTheme.primary = pc;
  else delete nextTheme.primary;
  const pcf = cleanColor(full.theme.primaryForeground);
  if (pcf) nextTheme.primaryForeground = pcf;
  else delete nextTheme.primaryForeground;
  const ac = cleanColor(full.theme.accent);
  if (ac) nextTheme.accent = ac;
  else delete nextTheme.accent;
  const acf = cleanColor(full.theme.accentForeground);
  if (acf) nextTheme.accentForeground = acf;
  else delete nextTheme.accentForeground;
  if (full.theme.radiusRem >= 0 && full.theme.radiusRem <= 2) {
    nextTheme.radiusRem = full.theme.radiusRem;
  } else {
    delete nextTheme.radiusRem;
  }

  const nextCopy: Record<string, unknown> = { ...prevCopy };
  if (full.copy.siteName.trim() && full.copy.siteName !== PUBLIC_SITE_DEFAULT_COPY.siteName) {
    nextCopy.siteName = full.copy.siteName.trim().slice(0, MAX_SHORT);
  } else {
    delete nextCopy.siteName;
  }
  if (full.copy.siteTagline.trim() && full.copy.siteTagline !== PUBLIC_SITE_DEFAULT_COPY.siteTagline) {
    nextCopy.siteTagline = full.copy.siteTagline.trim().slice(0, MAX_SHORT);
  } else {
    delete nextCopy.siteTagline;
  }
  if (full.copy.heroTitle.trim() && full.copy.heroTitle !== PUBLIC_SITE_DEFAULT_COPY.heroTitle) {
    nextCopy.heroTitle = full.copy.heroTitle.trim().slice(0, MAX_LONG);
  } else {
    delete nextCopy.heroTitle;
  }
  if (full.copy.heroSubtitle.trim() && full.copy.heroSubtitle !== PUBLIC_SITE_DEFAULT_COPY.heroSubtitle) {
    nextCopy.heroSubtitle = full.copy.heroSubtitle.trim().slice(0, MAX_LONG);
  } else {
    delete nextCopy.heroSubtitle;
  }
  if (
    full.copy.metaDescription.trim() &&
    full.copy.metaDescription !== PUBLIC_SITE_DEFAULT_COPY.metaDescription
  ) {
    nextCopy.metaDescription = full.copy.metaDescription.trim().slice(0, MAX_LONG);
  } else {
    delete nextCopy.metaDescription;
  }
  if (full.copy.promoBannerText?.trim()) {
    nextCopy.promoBannerText = full.copy.promoBannerText.trim().slice(0, MAX_LONG);
  } else {
    nextCopy.promoBannerText = null;
  }
  if (full.copy.footerLine.trim()) {
    nextCopy.footerLine = full.copy.footerLine.trim().slice(0, MAX_LONG);
  } else {
    delete nextCopy.footerLine;
  }

  const nextImages: Record<string, unknown> = { ...prevImages };
  const logo = cleanUrl(full.images.headerLogoUrl ?? undefined);
  if (logo) nextImages.headerLogoUrl = logo;
  else delete nextImages.headerLogoUrl;
  const icon = cleanUrl(full.images.headerIconUrl ?? undefined);
  if (icon) nextImages.headerIconUrl = icon;
  else delete nextImages.headerIconUrl;
  const hero = cleanUrl(full.images.heroBackgroundUrl ?? undefined);
  if (hero) nextImages.heroBackgroundUrl = hero;
  else delete nextImages.heroBackgroundUrl;
  const og = cleanUrl(full.images.ogImageUrl ?? undefined);
  if (og) nextImages.ogImageUrl = og;
  else delete nextImages.ogImageUrl;

  const settings_json: Record<string, unknown> = { ...prev };
  if (Object.keys(nextTheme).length) settings_json.theme = nextTheme;
  else delete settings_json.theme;
  if (Object.keys(nextCopy).length) settings_json.copy = nextCopy;
  else delete settings_json.copy;
  if (Object.keys(nextImages).length) settings_json.images = nextImages;
  else delete settings_json.images;

  const { error } = await admin.from("platform_public_site_settings").upsert(
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

  revalidatePath("/");
  revalidatePath("/platform/site-look");
  revalidatePath("/isletmeler");
  revalidatePath("/login");
  revalidatePath("/register");
  return { ok: true, error: null };
}
