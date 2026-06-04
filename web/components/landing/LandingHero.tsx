import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { FloatingShapes } from "@/components/landing/landing-shared";
import { HeroBannerVisual } from "@/components/landing/HeroBannerVisual";
import { cn } from "@/lib/utils";

type Props = {
  siteName: string;
  tagline: string;
  title: string;
  subtitle: string;
  heroImageUrl: string | null;
  salonCount: number;
  promoLine?: string;
};

export function LandingHero({
  siteName,
  tagline,
  title,
  subtitle,
  heroImageUrl,
  salonCount,
  promoLine,
}: Props) {
  const statLabel =
    salonCount > 0 ? `${salonCount}+ işletme platformda` : "500+ salon hedefi";

  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-br from-slate-50 via-background to-violet-50/80 dark:from-slate-950/50 dark:via-background dark:to-violet-950/30">
      <FloatingShapes />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:items-center md:gap-8 md:py-20 lg:py-24">
        <div className="relative z-10 space-y-7 md:pr-4">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/90 px-4 py-1.5 text-sm font-medium text-primary shadow-sm backdrop-blur">
            <Star className="h-4 w-4 fill-primary text-primary" aria-hidden />
            {tagline}
          </p>
          <h1 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight md:text-5xl lg:text-[3.35rem]">
            {title}
          </h1>
          <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">{subtitle}</p>
          {promoLine ? (
            <p className="max-w-lg rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-medium leading-snug">
              {promoLine}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className={cn(buttonVariants({ size: "lg" }), "shadow-lg shadow-primary/25")}
            >
              Ücretsiz başla
              <ArrowRight className="h-4 w-4" data-icon="inline-end" />
            </Link>
            <Link href="/#paketler" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Paketleri incele
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-4 border-t border-border/60 pt-6">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-primary/15 text-xs font-bold text-primary"
                >
                  {siteName.charAt(0)}
                </div>
              ))}
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-primary text-xs font-bold text-primary-foreground">
                +
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{statLabel}</span>
              <span className="mx-2 text-border">·</span>
              Online randevu yazılımı
            </p>
          </div>
        </div>

        <div className="relative z-10 md:-mt-4 lg:mt-0">
          <div className="absolute -left-2 top-6 z-20 hidden rounded-2xl border bg-card/95 px-4 py-3 text-sm shadow-xl backdrop-blur md:block">
            <p className="font-bold text-primary">7/24</p>
            <p className="text-muted-foreground">Online randevu</p>
          </div>
          <HeroBannerVisual
            imageUrl={heroImageUrl}
            alt={`${siteName} — mobil randevu uygulaması`}
          />
        </div>
      </div>
    </section>
  );
}
