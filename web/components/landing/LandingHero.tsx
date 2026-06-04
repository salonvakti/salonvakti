import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { DeviceMockup, FloatingShapes } from "@/components/landing/landing-shared";
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
    salonCount > 0 ? `${salonCount}+ işletme platformda` : "Salonlar için tasarlandı";

  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-background to-violet-500/5">
      <FloatingShapes />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-2 md:items-center md:py-24 lg:gap-16">
        <div className="space-y-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-4 py-1.5 text-sm font-medium text-primary shadow-sm backdrop-blur">
            <Star className="h-4 w-4 fill-primary text-primary" aria-hidden />
            {tagline}
          </p>
          <h1 className="text-balance text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl lg:text-[3.25rem]">
            {title}
          </h1>
          <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">{subtitle}</p>
          {promoLine ? (
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-medium leading-snug text-foreground">
              {promoLine}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "shadow-lg shadow-primary/20")}>
              Ücretsiz başla
              <ArrowRight className="h-4 w-4" data-icon="inline-end" />
            </Link>
            <Link href="/#paketler" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Paketleri incele
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-primary/15 text-xs font-bold text-primary"
                >
                  {siteName.charAt(0)}
                </div>
              ))}
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-primary text-xs font-bold text-primary-foreground">
                +
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{statLabel}</span>
              <span className="mx-2 text-border">·</span>
              Online randevu ve panel
            </p>
          </div>
        </div>
        <div className="relative flex justify-center md:justify-end">
          <div className="absolute -right-4 top-8 hidden rounded-2xl border bg-card/90 px-4 py-3 text-sm shadow-lg backdrop-blur lg:block">
            <p className="font-semibold text-primary">7/24</p>
            <p className="text-muted-foreground">Online randevu</p>
          </div>
          <DeviceMockup imageUrl={heroImageUrl} alt={`${siteName} uygulama önizlemesi`} />
        </div>
      </div>
    </section>
  );
}
