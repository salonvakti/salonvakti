import type { ResolvedPublicSiteSettings } from "@/types/public-site";

export const PUBLIC_SITE_DEFAULT_THEME: ResolvedPublicSiteSettings["theme"] = {
  primary: "",
  primaryForeground: "",
  accent: "",
  accentForeground: "",
  radiusRem: -1,
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
  headerIconUrl: null,
  heroBackgroundUrl: null,
  ogImageUrl: null,
};
