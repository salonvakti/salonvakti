/** Vitrin site ayarları (platform yönetimi; veritabanı settings_json ile eşleşir) */

export type PublicSiteThemeSettings = {
  primary?: string;
  primaryForeground?: string;
  accent?: string;
  accentForeground?: string;
  radiusRem?: number;
};

export type PublicSiteCopySettings = {
  siteName?: string;
  siteTagline?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  metaDescription?: string;
  promoBannerText?: string | null;
  footerLine?: string;
};

export type PublicSiteImageSettings = {
  headerLogoUrl?: string | null;
  headerIconUrl?: string | null;
  heroBackgroundUrl?: string | null;
  ogImageUrl?: string | null;
};

export type PublicSiteSettingsPayload = {
  theme?: PublicSiteThemeSettings;
  copy?: PublicSiteCopySettings;
  images?: PublicSiteImageSettings;
};

export type ResolvedPublicSiteSettings = {
  theme: Required<PublicSiteThemeSettings>;
  copy: Required<PublicSiteCopySettings>;
  images: Required<PublicSiteImageSettings>;
};
