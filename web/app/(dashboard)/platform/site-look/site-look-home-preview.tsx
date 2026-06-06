"use client";

import { cn } from "@/lib/utils";
import type { ResolvedPublicSiteSettings } from "@/types/public-site";
import { DEFAULT_LANDING_HERO_BANNER } from "@/lib/landing/default-assets";
import type { SectionId } from "./site-look-sections";

type Props = {
  s: ResolvedPublicSiteSettings;
  activeSection: SectionId;
};

function Block({
  id,
  active,
  label,
  children,
  className,
}: {
  id: SectionId;
  active: SectionId;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  const isActive = active === id;
  return (
    <div
      className={cn(
        "rounded-lg border transition-all",
        isActive ? "border-primary ring-2 ring-primary/25 shadow-md" : "border-transparent opacity-90",
        className
      )}
    >
      <p
        className={cn(
          "px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-wide",
          isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
        )}
      >
        {label}
        {isActive ? " · düzenleniyor" : ""}
      </p>
      {children}
    </div>
  );
}

export function SiteLookHomePreview({ s, activeSection }: Props) {
  const primary = s.theme.primary.trim() || "hsl(var(--primary))";
  const primaryFg = s.theme.primaryForeground.trim() || "hsl(var(--primary-foreground))";
  const heroImg =
    s.images.heroBackgroundUrl?.trim() ||
    s.images.ogImageUrl?.trim() ||
    DEFAULT_LANDING_HERO_BANNER;
  const wideImg = s.images.ogImageUrl?.trim() || s.images.heroBackgroundUrl?.trim() || null;
  const howImg = s.images.howItWorksImageUrl?.trim() || null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Ana sayfa önizlemesi
      </p>
      <div className="max-h-[min(70vh,640px)] space-y-2 overflow-y-auto rounded-xl border bg-muted/20 p-2 text-[0.65rem]">
        <Block id="theme" active={activeSection} label="Tema (tüm sayfa)">
          <div className="grid grid-cols-4 gap-1 p-2">
            {[primary, s.theme.accent.trim() || "var(--muted)"].map((c, i) => (
              <div key={i} className="h-4 rounded" style={{ background: c }} />
            ))}
          </div>
        </Block>

        <Block id="header" active={activeSection} label="Header">
          <div
            className="flex items-center justify-between rounded-t-md px-2 py-1.5"
            style={{ background: primary, color: primaryFg }}
          >
            <span className="truncate font-semibold">{s.copy.siteName || "Site"}</span>
            <span className="opacity-70">Menü</span>
          </div>
        </Block>

        <Block id="hero" active={activeSection} label="Kahraman">
          <div className="relative overflow-hidden rounded-b-md bg-gradient-to-br from-primary/10 to-violet-500/10 p-2">
            <p className="font-medium text-primary">{s.copy.siteTagline || "Üst etiket"}</p>
            <p className="mt-1 text-sm font-bold leading-tight">{s.copy.heroTitle || "Başlık"}</p>
            <p className="mt-1 line-clamp-2 text-muted-foreground">
              {s.copy.heroSubtitle || "Alt metin"}
            </p>
            {s.copy.promoBannerText ? (
              <p className="mt-2 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[0.6rem]">
                {s.copy.promoBannerText.slice(0, 80)}…
              </p>
            ) : null}
            <div className="relative mt-2 flex justify-end">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroImg}
                alt=""
                className="max-h-28 w-auto object-contain object-right drop-shadow-md"
              />
            </div>
          </div>
        </Block>

        <Block id="showcase" active={activeSection} label="Neden biz + Sistem">
          <div className="space-y-2 p-2">
            <div className="h-12 rounded bg-muted/60" />
            {wideImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={wideImg} alt="" className="h-14 w-full rounded object-cover" />
            ) : (
              <div className="flex h-14 items-center justify-center rounded border border-dashed text-muted-foreground">
                Neden biz görseli
              </div>
            )}
            <p className="text-[0.55rem] text-muted-foreground">Sistem nasıl çalışır</p>
            {howImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={howImg} alt="" className="h-14 w-full rounded object-cover" />
            ) : (
              <div className="flex h-14 items-center justify-center rounded border border-dashed text-muted-foreground">
                Sistem görseli
              </div>
            )}
          </div>
        </Block>

        <Block id="seo" active={activeSection} label="SEO & footer">
          <div className="space-y-1 p-2 text-muted-foreground">
            <p className="line-clamp-2">{s.copy.metaDescription || "Meta açıklama"}</p>
            {s.copy.footerLine ? (
              <p className="border-t pt-1 italic">{s.copy.footerLine}</p>
            ) : null}
          </div>
        </Block>

        <p className="px-1 text-[0.6rem] text-muted-foreground">
          Paketler, işletmeler, SSS → kod içeriği (bu sayfadan düzenlenmez)
        </p>
      </div>
    </div>
  );
}
