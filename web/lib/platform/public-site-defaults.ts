import type { ResolvedPublicSiteSettings } from "@/types/public-site";
import { DEFAULT_KVKK_TEXT } from "@/lib/platform/kvkk-default-text";

export const PUBLIC_SITE_DEFAULT_THEME: ResolvedPublicSiteSettings["theme"] = {
  primary: "oklch(0.74 0.16 55)",
  primaryForeground: "oklch(0.99 0 0)",
  accent: "oklch(0.97 0.03 75)",
  accentForeground: "oklch(0.42 0.14 40)",
  radiusRem: 0.625,
};

export const PUBLIC_SITE_DEFAULT_COPY: ResolvedPublicSiteSettings["copy"] = {
  siteName: "SalonVakti",
  siteTagline: "SalonVakti Web Uygulaması",
  heroTitle: "Online randevu ve salon yönetimi — tek platformda",
  heroSubtitle:
    "Online randevu alın, müşteri trafiğini paylaşılabilir bağlantı veya QR ile büyütün; işletmeniz talepleri onaylayarak takvimini kontrol etsin. Salon, kuaför ve güzellik merkezleri için tasarlandı.",
  metaDescription:
    "Küçük ve orta ölçekli salonlar için çok kiracılı SaaS randevu ve işletme yönetimi platformu.",
  promoBannerText: null,
  footerLine: "",
};

export const PUBLIC_SITE_DEFAULT_IMAGES: ResolvedPublicSiteSettings["images"] = {
  headerLogoUrl: null,
  headerMobileLogoUrl: null,
  headerIconUrl: null,
  heroBackgroundUrl: null,
  ogImageUrl: null,
  howItWorksImageUrl: null,
};

export const PUBLIC_SITE_DEFAULT_LEGAL: ResolvedPublicSiteSettings["legal"] = {
  kvkkText: DEFAULT_KVKK_TEXT,
};

export const PUBLIC_SITE_DEFAULT_INTEGRATIONS: ResolvedPublicSiteSettings["integrations"] = {
  googleMapsUrl: null,
  googleMapsPlaceId: null,
  googleMapsRating: null,
  googleMapsReviewCount: null,
  googleMapsReviews: [],
  googleMapsReviewsFetchedAt: null,
};
