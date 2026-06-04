"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, User } from "lucide-react";
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

export function SiteHeader({
  variant = "default",
}: {
  variant?: "default" | "landing" | "home3";
}) {
  const s = usePublicSiteSettings();
  const promoText = s.copy.promoBannerText?.trim() || SALON_GOOGLE_MAPS_PROMO;
  const isHome3 = variant === "home3";
  const isLanding = variant === "landing" || isHome3;
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    if (!isHome3) return;
    const onScroll = () => setSticky(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome3]);

  const logo = (
    <Link
      href="/"
      className={cn(
        "flex min-w-0 items-center gap-2 font-semibold tracking-tight",
        isHome3 ? "teeno-logo-link" : undefined
      )}
    >
      <span className={cn(isHome3 && "teeno-logo-wrap")}>
        {s.images.headerLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={s.images.headerLogoUrl}
            alt={s.copy.siteName}
            className="teeno-logo-img h-9 w-auto max-w-[200px] object-contain object-left"
          />
        ) : (
          <>
            {s.images.headerIconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.images.headerIconUrl}
                alt=""
                className="teeno-logo-img h-9 w-9 object-contain"
              />
            ) : (
              <Building2 className="teeno-logo-icon h-7 w-7 shrink-0" aria-hidden />
            )}
            <span className="teeno-logo-text truncate text-base font-bold">{s.copy.siteName}</span>
          </>
        )}
      </span>
    </Link>
  );

  const nav = (
    <nav className="hidden items-center gap-0.5 text-sm md:flex">
      {(isLanding ? landingLinks : []).map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            isHome3
              ? "teeno-nav-link rounded-lg px-3.5 py-2 text-[0.9375rem] font-semibold transition-colors"
              : buttonVariants({ variant: "ghost", size: "sm" })
          )}
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
  );

  const actions = (
    <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
      <Link
        href="/login"
        className={cn(
          isHome3
            ? "teeno-login-btn inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
            : buttonVariants({ variant: "ghost", size: "sm" })
        )}
      >
        {isHome3 ? <User className="h-4 w-4" aria-hidden /> : null}
        Giriş
      </Link>
      <Link
        href="/register"
        className={cn(
          isHome3
            ? "teeno-cta-btn inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold"
            : buttonVariants({ size: "sm" })
        )}
      >
        {isLanding ? "Ücretsiz başla" : "İşletme oluştur"}
      </Link>
    </div>
  );

  if (isHome3) {
    return (
      <header className={cn("teeno-header-2 w-full", sticky && "is-sticky")}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:py-5">
          {logo}
          {nav}
          {actions}
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b backdrop-blur-md",
        isLanding
          ? "border-transparent bg-background/70 supports-[backdrop-filter]:bg-background/60"
          : "bg-card/60 supports-[backdrop-filter]:bg-card/40"
      )}
    >
      {!isLanding ? <SitePromoStrip promoText={promoText} /> : null}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:py-4">
        {logo}
        {nav}
        {actions}
      </div>
    </header>
  );
}
