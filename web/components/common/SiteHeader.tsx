"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { SitePromoStrip } from "@/components/common/SitePromoStrip";
import { usePublicSiteSettings } from "@/components/providers/public-site-provider";
import { buttonVariants } from "@/components/ui/button";
import { SALON_GOOGLE_MAPS_PROMO } from "@/lib/marketing/salon-promo";

export function SiteHeader() {
  const s = usePublicSiteSettings();
  const promoText = s.copy.promoBannerText?.trim() || SALON_GOOGLE_MAPS_PROMO;

  return (
    <header className="sticky top-0 z-50 border-b bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
      <SitePromoStrip promoText={promoText} />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-2 font-semibold tracking-tight">
          {s.images.headerLogoUrl ? (
            <img
              src={s.images.headerLogoUrl}
              alt={s.copy.siteName}
              className="h-8 w-auto max-w-[200px] object-contain object-left"
            />
          ) : (
            <>
              {s.images.headerIconUrl ? (
                <img
                  src={s.images.headerIconUrl}
                  alt=""
                  className="h-8 w-8 object-contain"
                />
              ) : (
                <Building2 className="h-6 w-6 shrink-0" aria-hidden />
              )}
              <span className="truncate">{s.copy.siteName}</span>
            </>
          )}
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-2 text-sm">
          <Link href="/#paketler" className={buttonVariants({ variant: "ghost" })}>
            Paketler
          </Link>
          <Link href="/isletmeler" className={buttonVariants({ variant: "ghost" })}>
            İşletmeler
          </Link>
          <Link href="/customer/login" className={buttonVariants({ variant: "ghost" })}>
            Müşteri girişi
          </Link>
          <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
            İşletme girişi
          </Link>
          <Link href="/register" className={buttonVariants()}>
            İşletme oluştur
          </Link>
        </nav>
      </div>
    </header>
  );
}
