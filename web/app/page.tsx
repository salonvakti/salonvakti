import type { Metadata } from "next";
import { SiteFooter } from "@/components/common/SiteFooter";
import { SiteHeader } from "@/components/common/SiteHeader";
import { LandingAppShowcase } from "@/components/landing/LandingAppShowcase";
import { LandingCtaBand } from "@/components/landing/LandingCtaBand";
import { LandingFaq } from "@/components/landing/LandingFaq";
import { LandingFeaturesGrid } from "@/components/landing/LandingFeaturesGrid";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { LandingPricing } from "@/components/landing/LandingPricing";
import { LandingSalonsSection } from "@/components/landing/LandingSalonsSection";
import { LandingStats } from "@/components/landing/LandingStats";
import { LandingTestimonials } from "@/components/landing/LandingTestimonials";
import { LandingWhyChoose } from "@/components/landing/LandingWhyChoose";
import { DEFAULT_LANDING_HERO_BANNER } from "@/lib/landing/default-assets";
import { SALON_GOOGLE_MAPS_PROMO } from "@/lib/marketing/salon-promo";
import { getLandingPackagePriceLabels } from "@/lib/landing/package-prices";
import { getPublicSiteSettings } from "@/lib/platform/public-site-settings";
import { listPublicSalons } from "@/lib/public/salon-directory";
import { SITE_SEO_KEYWORDS } from "@/lib/seo/keywords";
import { absoluteUrl } from "@/lib/seo/site-url";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getPublicSiteSettings();
  const promo = site.copy.promoBannerText?.trim() || SALON_GOOGLE_MAPS_PROMO;
  const homeDescription =
    `${site.copy.siteName}: kuaför, berber ve güzellik merkezleri için online randevu yazılımı. Müşterileriniz anında online randevu alsın; siz takvim ve işletme yönetimini tek panelden yürütün. ${promo}`;

  return {
    title: {
      absolute: `${site.copy.siteName} — Online randevu yazılımı | Salon, kuaför ve güzellik merkezi randevu sistemi`,
    },
    description: homeDescription,
    keywords: [...SITE_SEO_KEYWORDS],
    openGraph: {
      title: `${site.copy.siteName} — Online randevu ve salon yönetimi`,
      description: homeDescription,
      locale: "tr_TR",
      type: "website",
      url: absoluteUrl("/"),
      siteName: site.copy.siteName,
      ...(site.images.ogImageUrl ? { images: [{ url: site.images.ogImageUrl }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${site.copy.siteName} — Online randevu yazılımı`,
      description: homeDescription,
    },
    alternates: {
      canonical: absoluteUrl("/"),
    },
    robots: { index: true, follow: true },
  };
}

export default async function HomePage() {
  const site = await getPublicSiteSettings();
  const promoDisplay = site.copy.promoBannerText?.trim() || SALON_GOOGLE_MAPS_PROMO;

  const heroImageUrl =
    site.images.heroBackgroundUrl?.trim() ||
    site.images.ogImageUrl?.trim() ||
    DEFAULT_LANDING_HERO_BANNER;
  const wideImageUrl =
    site.images.ogImageUrl?.trim() || site.images.heroBackgroundUrl?.trim() || null;
  const screenImageUrl =
    site.images.ogImageUrl?.trim() ||
    site.images.heroBackgroundUrl?.trim() ||
    site.images.headerLogoUrl?.trim() ||
    null;

  const prices = await getLandingPackagePriceLabels();
  const { salons: directorySalons } = await listPublicSalons();
  const showcaseSalons = directorySalons.slice(0, 6).map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    promoText: s.promoText,
  }));

  const pricingPlans = [
    {
      slug: "basic" as const,
      name: "Basic",
      tagline: "Yeni başlayan ve tek şubeli salonlar için ideal başlangıç.",
      priceLabel: prices.basic,
      features: [
        "7/24 online randevu sistemi",
        "Müşteri kayıtları ve geçmiş işlemler",
        "Personel yönetimi",
        "Hizmet ve fiyat tanımlama",
        "Salonunuza özel tanıtım sayfası",
        "Temel gelir ve performans raporları",
      ],
      audience: "Yeni açılan güzellik salonları, kuaförler ve küçük işletmeler.",
    },
    {
      slug: "pro" as const,
      name: "Pro",
      tagline: "Büyümek isteyen salonlar için profesyonel çözümler.",
      priceLabel: prices.pro,
      features: [
        "Basic paketteki tüm özellikler",
        "Aylık 500 SMS gönderimi",
        "Otomatik e-posta hatırlatmaları",
        "2 şubeye kadar kullanım",
        "Gelişmiş analiz ve raporlama",
        "Google Takvim senkronizasyonu",
      ],
      audience: "Yoğun trafikli salonlar ve güzellik merkezleri.",
      highlighted: true,
      badge: "Öne çıkan",
    },
    {
      slug: "ultimate" as const,
      name: "Ultimate",
      tagline: "Kurumsal düzeyde yönetim ve sınırsız özellikler.",
      priceLabel: prices.ultimate,
      features: [
        "Pro paketteki tüm özellikler",
        "Sınırsız SMS ve e-posta",
        "WhatsApp entegrasyonu",
        "Sınırsız şube yönetimi",
        "Yapay zekâ destekli analiz",
        "7/24 öncelikli destek",
      ],
      audience: "Zincir salonlar, franchise ve kurumsal işletmeler.",
    },
  ];

  return (
    <div className="slnvkt-home flex min-h-screen flex-col">
      <SiteHeader />
      <main className="relative flex-1">
        <LandingHero
          siteName={site.copy.siteName}
          title={site.copy.heroTitle}
          subtitle={site.copy.heroSubtitle}
          heroImageUrl={heroImageUrl}
          salonCount={directorySalons.length}
          promoLine={promoDisplay}
        />
        <LandingStats salonCount={directorySalons.length} />
        <LandingHowItWorks />
        <LandingWhyChoose siteName={site.copy.siteName} showcaseImageUrl={wideImageUrl} />
        <LandingFeaturesGrid />
        <LandingAppShowcase siteName={site.copy.siteName} screenImageUrl={screenImageUrl} />
        <LandingSalonsSection salons={showcaseSalons} />
        <LandingPricing plans={pricingPlans} promoLine={promoDisplay} />
        <LandingTestimonials />
        <LandingFaq siteName={site.copy.siteName} />
        <LandingCtaBand siteName={site.copy.siteName} />
      </main>
      <SiteFooter variant="landing" />
    </div>
  );
}
