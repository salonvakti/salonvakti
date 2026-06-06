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
  /** Ana sayfa «Sistem nasıl çalışır» bölümü görseli */
  howItWorksImageUrl?: string | null;
};

/** Google Haritalar vitrin yorumları (Places API ile önbellek) */
export type GoogleMapsReview = {
  authorName: string;
  rating: number;
  text: string;
  relativeTime: string;
  profilePhotoUrl: string | null;
};

export type PublicSiteIntegrationsSettings = {
  googleMapsUrl?: string | null;
  googleMapsPlaceId?: string | null;
  googleMapsRating?: number | null;
  googleMapsReviewCount?: number | null;
  googleMapsReviews?: GoogleMapsReview[];
  googleMapsReviewsFetchedAt?: string | null;
};

export type PublicSiteSettingsPayload = {
  theme?: PublicSiteThemeSettings;
  copy?: PublicSiteCopySettings;
  images?: PublicSiteImageSettings;
  integrations?: PublicSiteIntegrationsSettings;
};

export type ResolvedPublicSiteSettings = {
  theme: Required<PublicSiteThemeSettings>;
  copy: Required<PublicSiteCopySettings>;
  images: Required<PublicSiteImageSettings>;
  integrations: Required<PublicSiteIntegrationsSettings>;
};
