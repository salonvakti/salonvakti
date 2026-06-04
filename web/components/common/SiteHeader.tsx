"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { SitePromoStrip } from "@/components/common/SitePromoStrip";
import { usePublicSiteSettings } from "@/components/providers/public-site-provider";
import { buttonVariants } from "@/components/ui/button";
import { SALON_GOOGLE_MAPS_PROMO } from "@/lib/marketing/salon-promo";
import { cn } from "@/lib/utils";

const landingLinks = [
  { href: "/#hakkimizda", label: "Hakkında" },
  { href: "/#ozellikler", label: "Özellikler" },
  { href: "/#paketler", label: "Paketler" },
  { href: "/#sss", label: "SSS" },
  { href: "/isletmeler", label: "İşletmeler" },
];

export function SiteHeader({ variant = "default" }: { variant?: "default" | "landing" }) {
  const s = usePublicSiteSettings();
  const promoText = s.copy.promoBannerText?.trim() || SALON_GOOGLE_MAPS_PROMO;
  const isLanding = variant === "landing";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b backdrop-blur-md",
        isLanding
          ? "border-transparent bg-background/70 supports-[backdrop-filter]:bg-background/60"
          : "bg-card/60 supports-[backdrop-filter]:bg-card/40"
      )}
    >
      {isLanding ? null : <SitePromoStrip promoText={promoText} />}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:py-4">
        <Link href="/" className="flex min-w-0 items-center gap-2 font-semibold tracking-tight">
          {s.images.headerLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={s.images.headerLogoUrl}
              alt={s.copy.siteName}
              className="h-8 w-auto max-w-[180px] object-contain object-left"
            />
          ) : (
            <>
              {s.images.headerIconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.images.headerIconUrl} alt="" className="h-8 w-8 object-contain" />
              ) : (
                <Building2 className="h-6 w-6 shrink-0 text-primary" aria-hidden />
              )}
              <span className="truncate">{s.copy.siteName}</span>
            </>
          )}
        </Link>
        <nav className="hidden items-center gap-1 text-sm md:flex">
          {(isLanding ? landingLinks : []).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              {link.label}
            </Link>
          ))}
          {!isLanding ? (
            <>
              <Link href="/#paketler" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Paketler
              </Link>
              <Link href="/isletmeler" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                İşletmeler
              </Link>
            </>
          ) : null}
        </nav>
        <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <Link
            href="/login"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Giriş
          </Link>
          <Link href="/register" className={buttonVariants({ size: "sm" })}>
            {isLanding ? "Ücretsiz başla" : "İşletme oluştur"}
          </Link>
        </div>
      </div>
    </header>
  );
}
