import Link from "next/link";
import { Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SALON_GOOGLE_MAPS_PROMO } from "@/lib/marketing/salon-promo";

/** Ana sayfada üst şeritten sonra büyük tipografi ile kampanya vurgusu */
export function HomePromoBillboard() {
  return (
    <section
      className="border-b-2 border-amber-500/40 bg-gradient-to-b from-amber-100/90 via-amber-50/80 to-background dark:from-amber-950/50 dark:via-amber-950/25 dark:to-background"
      aria-labelledby="home-promo-heading"
    >
      <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        <div className="flex flex-col items-center gap-3 text-center">
          <p
            id="home-promo-heading"
            className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-200"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Kampanya
          </p>
          <p className="text-balance text-2xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
            {SALON_GOOGLE_MAPS_PROMO}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/register" className={buttonVariants({ size: "lg" })}>
              Şimdi ücretsiz başla
            </Link>
            <Link
              href="/#paketler"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Paketlere bak
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
