"use client";

import Link from "next/link";
import { usePublicSiteSettings } from "@/components/providers/public-site-provider";
import { SALON_GOOGLE_MAPS_PROMO } from "@/lib/marketing/salon-promo";

const linkGroups = [
  {
    title: "Platform",
    links: [
      { href: "/register", label: "Kayıt ol" },
      { href: "/login", label: "Giriş" },
      { href: "/#paketler", label: "Paketler" },
      { href: "/isletmeler", label: "İşletmeler" },
    ],
  },
  {
    title: "Özellikler",
    links: [
      { href: "/#ozellikler", label: "Modüller" },
      { href: "/#hakkimizda", label: "Hakkında" },
      { href: "/#sss", label: "SSS" },
      { href: "/customer/login", label: "Müşteri girişi" },
    ],
  },
  {
    title: "Keşfet",
    links: [
      { href: "/register", label: "İşletme oluştur" },
      { href: "/isletmeler", label: "Salon dizini" },
      { href: "/#isletmeler", label: "Öne çıkanlar" },
    ],
  },
];

export function SiteFooter({ variant = "default" }: { variant?: "default" | "landing" }) {
  const s = usePublicSiteSettings();
  const promoBox = s.copy.promoBannerText?.trim() || SALON_GOOGLE_MAPS_PROMO;
  const isLanding = variant === "landing";

  return (
    <footer className="border-t bg-muted/30">
      {isLanding ? (
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <p className="text-lg font-bold text-foreground">{s.copy.siteName}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {s.copy.metaDescription.slice(0, 160)}
              {s.copy.metaDescription.length > 160 ? "…" : ""}
            </p>
          </div>
          {linkGroups.map((group) => (
            <div key={group.title}>
              <p className="text-sm font-semibold text-foreground">{group.title}</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-10">
          <p className="rounded-xl border-2 border-amber-500/35 bg-amber-500/10 px-4 py-4 text-center text-sm font-semibold leading-snug text-foreground md:text-base">
            {promoBox}
          </p>
          {s.copy.footerLine ? (
            <p className="mt-4 text-center text-sm text-muted-foreground">{s.copy.footerLine}</p>
          ) : null}
        </div>
      )}
      <div className="border-t bg-background/80 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {s.copy.siteName}. Tüm hakları saklıdır.
          </p>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Alt navigasyon">
            <Link href="/" className="hover:text-foreground">
              Ana sayfa
            </Link>
            <Link href="/isletmeler" className="hover:text-foreground">
              İşletmeler
            </Link>
            <Link href="/login" className="hover:text-foreground">
              Giriş
            </Link>
          </nav>
        </div>
        {isLanding && s.copy.footerLine ? (
          <p className="mx-auto mt-4 max-w-6xl px-4 text-center text-xs text-muted-foreground">
            {s.copy.footerLine}
          </p>
        ) : null}
      </div>
    </footer>
  );
}
