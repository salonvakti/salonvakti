import "server-only";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  PUBLIC_SITE_DEFAULT_COPY,
  PUBLIC_SITE_DEFAULT_IMAGES,
  PUBLIC_SITE_DEFAULT_THEME,
} from "@/lib/platform/public-site-defaults";
import type {
  PublicSiteCopySettings,
  PublicSiteImageSettings,
  PublicSiteSettingsPayload,
  PublicSiteThemeSettings,
  ResolvedPublicSiteSettings,
} from "@/types/public-site";

export type {
  PublicSiteCopySettings,
  PublicSiteImageSettings,
  PublicSiteSettingsPayload,
  PublicSiteThemeSettings,
  ResolvedPublicSiteSettings,
} from "@/types/public-site";

const DEFAULT_THEME = PUBLIC_SITE_DEFAULT_THEME;
const DEFAULT_COPY = PUBLIC_SITE_DEFAULT_COPY;
const DEFAULT_IMAGES = PUBLIC_SITE_DEFAULT_IMAGES;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function parsePayload(raw: unknown): PublicSiteSettingsPayload {
  if (!isRecord(raw)) return {};
  const theme = isRecord(raw.theme) ? (raw.theme as PublicSiteThemeSettings) : undefined;
  const copy = isRecord(raw.copy) ? (raw.copy as PublicSiteCopySettings) : undefined;
  const images = isRecord(raw.images) ? (raw.images as PublicSiteImageSettings) : undefined;
  return { theme, copy, images };
}

export function mergePublicSiteSettings(raw: unknown): ResolvedPublicSiteSettings {
  const p = parsePayload(raw);
  const t = p.theme ?? {};
  const c = p.copy ?? {};
  const i = p.images ?? {};
  return {
    theme: {
      primary: typeof t.primary === "string" ? t.primary.trim() : DEFAULT_THEME.primary,
      primaryForeground:
        typeof t.primaryForeground === "string" ? t.primaryForeground.trim() : DEFAULT_THEME.primaryForeground,
      accent: typeof t.accent === "string" ? t.accent.trim() : DEFAULT_THEME.accent,
      accentForeground:
        typeof t.accentForeground === "string" ? t.accentForeground.trim() : DEFAULT_THEME.accentForeground,
      radiusRem:
        typeof t.radiusRem === "number" && Number.isFinite(t.radiusRem) ? t.radiusRem : DEFAULT_THEME.radiusRem,
    },
    copy: {
      siteName: typeof c.siteName === "string" && c.siteName.trim() ? c.siteName.trim() : DEFAULT_COPY.siteName,
      siteTagline:
        typeof c.siteTagline === "string" && c.siteTagline.trim()
          ? c.siteTagline.trim()
          : DEFAULT_COPY.siteTagline,
      heroTitle:
        typeof c.heroTitle === "string" && c.heroTitle.trim() ? c.heroTitle.trim() : DEFAULT_COPY.heroTitle,
      heroSubtitle:
        typeof c.heroSubtitle === "string" && c.heroSubtitle.trim()
          ? c.heroSubtitle.trim()
          : DEFAULT_COPY.heroSubtitle,
      metaDescription:
        typeof c.metaDescription === "string" && c.metaDescription.trim()
          ? c.metaDescription.trim()
          : DEFAULT_COPY.metaDescription,
      promoBannerText:
        typeof c.promoBannerText === "string"
          ? c.promoBannerText.trim() || null
          : c.promoBannerText === null
            ? null
            : DEFAULT_COPY.promoBannerText,
      footerLine:
        typeof c.footerLine === "string" ? c.footerLine.trim() : DEFAULT_COPY.footerLine,
    },
    images: {
      headerLogoUrl:
        typeof i.headerLogoUrl === "string" && i.headerLogoUrl.trim()
          ? i.headerLogoUrl.trim()
          : i.headerLogoUrl === null
            ? null
            : DEFAULT_IMAGES.headerLogoUrl,
      headerIconUrl:
        typeof i.headerIconUrl === "string" && i.headerIconUrl.trim()
          ? i.headerIconUrl.trim()
          : i.headerIconUrl === null
            ? null
            : DEFAULT_IMAGES.headerIconUrl,
      heroBackgroundUrl:
        typeof i.heroBackgroundUrl === "string" && i.heroBackgroundUrl.trim()
          ? i.heroBackgroundUrl.trim()
          : i.heroBackgroundUrl === null
            ? null
            : DEFAULT_IMAGES.heroBackgroundUrl,
      ogImageUrl:
        typeof i.ogImageUrl === "string" && i.ogImageUrl.trim()
          ? i.ogImageUrl.trim()
          : i.ogImageUrl === null
            ? null
            : DEFAULT_IMAGES.ogImageUrl,
    },
  };
}

export function themeToCssVars(theme: ResolvedPublicSiteSettings["theme"]): Record<string, string> {
  const out: Record<string, string> = {};
  if (theme.primary) out["--primary"] = theme.primary;
  if (theme.primaryForeground) out["--primary-foreground"] = theme.primaryForeground;
  if (theme.accent) out["--accent"] = theme.accent;
  if (theme.accentForeground) out["--accent-foreground"] = theme.accentForeground;
  if (theme.radiusRem >= 0 && theme.radiusRem <= 2) {
    out["--radius"] = `${theme.radiusRem}rem`;
  }
  return out;
}

async function getPublicSiteSettingsUncached(): Promise<ResolvedPublicSiteSettings> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return mergePublicSiteSettings({});
  }

  const { data, error } = await supabase
    .from("platform_public_site_settings")
    .select("settings_json")
    .eq("id", "default")
    .maybeSingle();

  if (error || !data) {
    return mergePublicSiteSettings({});
  }

  return mergePublicSiteSettings((data as { settings_json: unknown }).settings_json);
}

export const getPublicSiteSettings = cache(getPublicSiteSettingsUncached);
