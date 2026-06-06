import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { HeroBannerVisual } from "@/components/landing/HeroBannerVisual";
import { DEFAULT_LANDING_HERO_BANNER, SLNVKT_HOME_HERO_BG } from "@/lib/landing/default-assets";

type Props = {
  siteName: string;
  title: string;
  subtitle: string;
  heroImageUrl: string | null;
  promoLine?: string;
};

export function LandingHero({
  siteName,
  title,
  subtitle,
  heroImageUrl,
  promoLine,
}: Props) {
  const bannerSrc = heroImageUrl?.trim() || DEFAULT_LANDING_HERO_BANNER;

  return (
    <section
      className="hero-banner hero-banner-3"
      style={{ backgroundImage: `url(${SLNVKT_HOME_HERO_BG})` }}
    >
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="banner-content relative z-10">
            <h1>{title}</h1>
            <p>{subtitle}</p>
            {promoLine ? (
              <p className="!mt-4 rounded-xl border border-[#f79b22]/35 bg-[#f79b22]/10 px-4 py-3 !text-sm font-medium !text-[#9a3412]">
                {promoLine}
              </p>
            ) : null}
            <div className="btn-groups">
              <Link href="/register" className="btn-slnvkt-primary">
                Ücretsiz başla
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/#paketler" className="btn-slnvkt-outline">
                Paketleri incele
              </Link>
            </div>
          </div>

          <div className="banner-image">
            {bannerSrc.startsWith("/") ? (
              <Image
                src={bannerSrc}
                alt={`${siteName} — mobil randevu`}
                width={640}
                height={720}
                priority
                className="mx-auto h-auto w-full max-w-[min(100%,520px)] object-contain lg:ml-auto lg:max-w-[560px]"
                sizes="(max-width: 1024px) 90vw, 560px"
              />
            ) : (
              <HeroBannerVisual
                imageUrl={bannerSrc}
                alt={`${siteName} — mobil randevu`}
                className="lg:justify-end"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
