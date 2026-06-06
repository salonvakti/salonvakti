import "server-only";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  PUBLIC_SITE_DEFAULT_COPY,
  PUBLIC_SITE_DEFAULT_IMAGES,
  PUBLIC_SITE_DEFAULT_INTEGRATIONS,
  PUBLIC_SITE_DEFAULT_LEGAL,
  PUBLIC_SITE_DEFAULT_THEME,
} from "@/lib/platform/public-site-defaults";
import type {
  GoogleMapsReview,
  PublicSiteCopySettings,
  PublicSiteImageSettings,
  PublicSiteLegalSettings,
  PublicSiteIntegrationsSettings,
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
const DEFAULT_LEGAL = PUBLIC_SITE_DEFAULT_LEGAL;
const DEFAULT_INTEGRATIONS = PUBLIC_SITE_DEFAULT_INTEGRATIONS;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function parsePayload(raw: unknown): PublicSiteSettingsPayload {
  if (!isRecord(raw)) return {};
  const theme = isRecord(raw.theme) ? (raw.theme as PublicSiteThemeSettings) : undefined;
  const copy = isRecord(raw.copy) ? (raw.copy as PublicSiteCopySettings) : undefined;
  const images = isRecord(raw.images) ? (raw.images as PublicSiteImageSettings) : undefined;
  const legal = isRecord(raw.legal) ? (raw.legal as PublicSiteLegalSettings) : undefined;
  const integrations = isRecord(raw.integrations)
    ? (raw.integrations as PublicSiteIntegrationsSettings)
    : undefined;
  return { theme, copy, images, legal, integrations };
}

function parseGoogleReviews(raw: unknown): GoogleMapsReview[] {
  if (!Array.isArray(raw)) return [];
  const out: GoogleMapsReview[] = [];
  for (const item of raw) {
    if (!isRecord(item)) continue;
    const text = typeof item.text === "string" ? item.text.trim() : "";
    if (!text) continue;
    out.push({
      authorName:
        typeof item.authorName === "string" && item.authorName.trim()
          ? item.authorName.trim()
          : "Google kullanıcısı",
      rating:
        typeof item.rating === "number" && item.rating >= 1 && item.rating <= 5
          ? item.rating
          : 5,
      text,
      relativeTime: typeof item.relativeTime === "string" ? item.relativeTime.trim() : "",
      profilePhotoUrl:
        typeof item.profilePhotoUrl === "string" && item.profilePhotoUrl.trim()
          ? item.profilePhotoUrl.trim()
          : null,
    });
  }
  return out;
}

export function mergePublicSiteSettings(raw: unknown): ResolvedPublicSiteSettings {
  const p = parsePayload(raw);
  const t = p.theme ?? {};
  const c = p.copy ?? {};
  const i = p.images ?? {};
  const l = p.legal ?? {};
  const g = p.integrations ?? {};
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
      headerMobileLogoUrl:
        typeof i.headerMobileLogoUrl === "string" && i.headerMobileLogoUrl.trim()
          ? i.headerMobileLogoUrl.trim()
          : i.headerMobileLogoUrl === null
            ? null
            : DEFAULT_IMAGES.headerMobileLogoUrl,
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
      howItWorksImageUrl:
        typeof i.howItWorksImageUrl === "string" && i.howItWorksImageUrl.trim()
          ? i.howItWorksImageUrl.trim()
          : i.howItWorksImageUrl === null
            ? null
            : DEFAULT_IMAGES.howItWorksImageUrl,
    },
    legal: {
      kvkkText:
        typeof l.kvkkText === "string" && l.kvkkText.trim() ? l.kvkkText.trim() : DEFAULT_LEGAL.kvkkText,
    },
    integrations: {
      googleMapsUrl:
        typeof g.googleMapsUrl === "string" && g.googleMapsUrl.trim()
          ? g.googleMapsUrl.trim()
          : g.googleMapsUrl === null
            ? null
            : DEFAULT_INTEGRATIONS.googleMapsUrl,
      googleMapsPlaceId:
        typeof g.googleMapsPlaceId === "string" && g.googleMapsPlaceId.trim()
          ? g.googleMapsPlaceId.trim()
          : g.googleMapsPlaceId === null
            ? null
            : DEFAULT_INTEGRATIONS.googleMapsPlaceId,
      googleMapsRating:
        typeof g.googleMapsRating === "number" && Number.isFinite(g.googleMapsRating)
          ? g.googleMapsRating
          : DEFAULT_INTEGRATIONS.googleMapsRating,
      googleMapsReviewCount:
        typeof g.googleMapsReviewCount === "number" && Number.isFinite(g.googleMapsReviewCount)
          ? g.googleMapsReviewCount
          : DEFAULT_INTEGRATIONS.googleMapsReviewCount,
      googleMapsReviews: parseGoogleReviews(g.googleMapsReviews),
      googleMapsReviewsFetchedAt:
        typeof g.googleMapsReviewsFetchedAt === "string" && g.googleMapsReviewsFetchedAt.trim()
          ? g.googleMapsReviewsFetchedAt.trim()
          : DEFAULT_INTEGRATIONS.googleMapsReviewsFetchedAt,
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
