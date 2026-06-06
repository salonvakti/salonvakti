"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, User } from "lucide-react";
import { usePublicSiteSettings } from "@/components/providers/public-site-provider";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/#hakkimizda", label: "Hakkında" },
  { href: "/#ozellikler", label: "Özellikler" },
  { href: "/#paketler", label: "Paketler" },
  { href: "/#sss", label: "SSS" },
  { href: "/isletmeler", label: "İşletmeler" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const isHomeOverlay = pathname === "/";
  const s = usePublicSiteSettings();
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "slnvkt-header w-full",
        isHomeOverlay && "slnvkt-header--overlay",
        isHomeOverlay && sticky && "is-sticky"
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:py-5">
        <Link
          href="/"
          className="slnvkt-logo-link flex min-w-0 max-w-[42%] shrink items-center gap-2 font-semibold tracking-tight sm:max-w-none"
        >
          <span className="slnvkt-logo-wrap min-w-0">
            {s.images.headerLogoUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.images.headerMobileLogoUrl?.trim() || s.images.headerLogoUrl}
                  alt={s.copy.siteName}
                  className="slnvkt-logo-img slnvkt-logo-img--mobile md:hidden"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.images.headerLogoUrl}
                  alt={s.copy.siteName}
                  className="slnvkt-logo-img slnvkt-logo-img--desktop hidden md:block"
                />
              </>
            ) : (
              <>
                {s.images.headerIconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.images.headerIconUrl}
                    alt=""
                    className="slnvkt-logo-img h-9 w-9 object-contain"
                  />
                ) : (
                  <Building2 className="slnvkt-logo-icon h-7 w-7 shrink-0" aria-hidden />
                )}
                <span className="slnvkt-logo-text truncate text-base font-bold">{s.copy.siteName}</span>
              </>
            )}
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 text-sm md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="slnvkt-nav-link rounded-lg px-3.5 py-2 text-[0.9375rem] font-semibold transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <Link
            href="/login"
            className="slnvkt-login-btn inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
          >
            <User className="h-4 w-4" aria-hidden />
            Giriş
          </Link>
          <Link
            href="/register"
            className="slnvkt-cta-btn inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold"
          >
            Ücretsiz başla
          </Link>
        </div>
      </div>
    </header>
  );
}
