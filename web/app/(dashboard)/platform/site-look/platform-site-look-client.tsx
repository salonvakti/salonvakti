"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ExternalLink, ImagePlus, Save } from "lucide-react";
import { savePlatformSiteSettingsAction } from "./actions";
import { SiteLookHomePreview } from "./site-look-home-preview";
import { SITE_LOOK_SECTIONS, type SectionId } from "./site-look-sections";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ResolvedPublicSiteSettings } from "@/types/public-site";

const textareaClass =
  "flex min-h-[88px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30";

function Field({
  id,
  label,
  hint,
  homeAnchor,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  homeAnchor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        {homeAnchor ? (
          <span className="text-[0.65rem] font-medium text-primary">{homeAnchor}</span>
        ) : null}
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {children}
    </div>
  );
}

function ColorField({
  id,
  label,
  hint,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const swatch = value.trim();
  return (
    <Field id={id} label={label} hint={hint}>
      <div className="flex gap-2">
        <span
          className="h-9 w-9 shrink-0 rounded-md border shadow-inner"
          style={{ background: swatch || "var(--muted)" }}
          aria-hidden
        />
        <Input
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="font-mono text-xs"
        />
      </div>
    </Field>
  );
}

function ImageUrlField({
  id,
  label,
  hint,
  homeAnchor,
  value,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  hint?: string;
  homeAnchor?: string;
  value: string | null;
  onChange: (v: string | null) => void;
  disabled?: boolean;
}) {
  const url = (value ?? "").trim();
  const showPreview = url.startsWith("https://");

  return (
    <Field id={id} label={label} hint={hint} homeAnchor={homeAnchor}>
      <div className="flex gap-2">
        <Input
          id={id}
          type="url"
          placeholder="https://..."
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value.trim() || null)}
          disabled={disabled}
          className="flex-1"
        />
        <Link
          href="/platform/media"
          className={buttonVariants({ variant: "outline", size: "sm", className: "shrink-0" })}
        >
          <ImagePlus className="h-3.5 w-3.5" data-icon="inline-start" />
          Medya
        </Link>
      </div>
      {showPreview ? (
        <div className="mt-2 overflow-hidden rounded-lg border bg-muted/30 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            className="mx-auto max-h-28 max-w-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      ) : null}
    </Field>
  );
}

export function PlatformSiteLookClient({ initial }: { initial: ResolvedPublicSiteSettings }) {
  const [s, setS] = useState<ResolvedPublicSiteSettings>(initial);
  const [activeSection, setActiveSection] = useState<SectionId>("hero");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const activeMeta = useMemo(
    () => SITE_LOOK_SECTIONS.find((sec) => sec.id === activeSection) ?? SITE_LOOK_SECTIONS[0],
    [activeSection]
  );

  function save() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const res = await savePlatformSiteSettingsAction(s);
      if (!res.ok) {
        setError(res.error ?? "Kayıt başarısız.");
        return;
      }
      setMessage("Kaydedildi. Ana sayfa birkaç saniye içinde güncellenir.");
    });
  }

  return (
    <form
      className="flex min-h-0 flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <div className="sticky top-0 z-10 -mx-1 border-b bg-background/95 px-1 pb-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Site görünümü</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Alanlar ana sayfa yapısıyla eşleştirilmiştir (kahraman → vitrin → SEO). Renk: hex veya{" "}
              <code className="rounded bg-muted px-1 text-xs">oklch(...)</code>; görseller{" "}
              <strong className="font-medium">https</strong>.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <ExternalLink className="h-3.5 w-3.5" data-icon="inline-start" />
              Ana sayfayı aç
            </Link>
            <Button type="submit" size="sm" disabled={pending}>
              <Save className="h-3.5 w-3.5" data-icon="inline-start" />
              {pending ? "Kaydediliyor…" : "Kaydet"}
            </Button>
          </div>
        </div>
        {error ? (
          <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="mt-3 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            {message}
          </p>
        ) : null}
      </div>

      <Card className="mt-6 border-primary/20 bg-primary/5 shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-3 py-4 text-sm">
          <span className="font-medium text-foreground">Ana sayfa akışı:</span>
          {SITE_LOOK_SECTIONS.map((sec, i) => (
            <span key={sec.id} className="flex items-center gap-2 text-muted-foreground">
              {i > 0 ? <span aria-hidden>→</span> : null}
              <button
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={cn(
                  "rounded-md px-2 py-0.5 transition-colors hover:bg-background",
                  activeSection === sec.id && "bg-background font-medium text-primary shadow-sm"
                )}
              >
                {sec.homeBlock}
              </button>
            </span>
          ))}
          <span className="text-muted-foreground">→ Paketler / SSS (sabit)</span>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,12rem)_minmax(0,1fr)_minmax(0,16rem)] lg:items-start">
        <nav
          className="flex gap-1 overflow-x-auto pb-1 lg:sticky lg:top-36 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0"
          aria-label="Ana sayfa bölümleri"
        >
          {SITE_LOOK_SECTIONS.map(({ id, label, icon: Icon, homeBlock }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSection(id)}
              className={cn(
                "flex shrink-0 flex-col items-start gap-0.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                activeSection === id
                  ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                  : "text-muted-foreground"
              )}
            >
              <span className="flex items-center gap-2 font-medium">
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {label}
              </span>
              <span
                className={cn(
                  "pl-6 text-[0.65rem]",
                  activeSection === id ? "text-primary-foreground/80" : ""
                )}
              >
                {homeBlock}
              </span>
            </button>
          ))}
        </nav>

        <Card className="min-w-0 shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base">{activeMeta.label}</CardTitle>
            <CardDescription>{activeMeta.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            {activeSection === "theme" ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <ColorField
                  id="t-primary"
                  label="Birincil renk"
                  hint="Kahraman CTA, istatistik bandı, düğmeler"
                  placeholder="#6366f1"
                  value={s.theme.primary}
                  disabled={pending}
                  onChange={(v) => setS((o) => ({ ...o, theme: { ...o.theme, primary: v } }))}
                />
                <ColorField
                  id="t-pf"
                  label="Birincil yazı rengi"
                  placeholder="#ffffff"
                  value={s.theme.primaryForeground}
                  disabled={pending}
                  onChange={(v) =>
                    setS((o) => ({ ...o, theme: { ...o.theme, primaryForeground: v } }))
                  }
                />
                <ColorField
                  id="t-ac"
                  label="Vurgu (accent)"
                  hint="Gradient ve ikincil vurgular"
                  value={s.theme.accent}
                  disabled={pending}
                  onChange={(v) => setS((o) => ({ ...o, theme: { ...o.theme, accent: v } }))}
                />
                <ColorField
                  id="t-acf"
                  label="Vurgu yazı rengi"
                  value={s.theme.accentForeground}
                  disabled={pending}
                  onChange={(v) =>
                    setS((o) => ({ ...o, theme: { ...o.theme, accentForeground: v } }))
                  }
                />
                <div className="sm:col-span-2">
                  <Field
                    id="t-r"
                    label="Köşe yuvarlaklığı (rem)"
                    hint="Kartlar ve düğmeler; boş = varsayılan"
                  >
                    <Input
                      id="t-r"
                      type="number"
                      step="0.125"
                      min={0}
                      max={2}
                      placeholder="0.625"
                      value={s.theme.radiusRem >= 0 ? s.theme.radiusRem : ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setS((o) => ({
                          ...o,
                          theme: { ...o.theme, radiusRem: v === "" ? -1 : Number(v) },
                        }));
                      }}
                      disabled={pending}
                      className="max-w-xs"
                    />
                  </Field>
                </div>
              </div>
            ) : null}

            {activeSection === "header" ? (
              <div className="grid max-w-xl gap-5">
                <Field
                  id="c-name"
                  label="Site adı"
                  homeAnchor="Header · footer"
                  hint="Logo yoksa metin olarak gösterilir"
                >
                  <Input
                    id="c-name"
                    value={s.copy.siteName}
                    onChange={(e) =>
                      setS((o) => ({ ...o, copy: { ...o.copy, siteName: e.target.value } }))
                    }
                    disabled={pending}
                  />
                </Field>
                <ImageUrlField
                  id="i-logo"
                  label="Geniş logo"
                  homeAnchor="Header"
                  hint="Varsa site adı metni gizlenir"
                  value={s.images.headerLogoUrl}
                  disabled={pending}
                  onChange={(v) =>
                    setS((o) => ({ ...o, images: { ...o.images, headerLogoUrl: v } }))
                  }
                />
                <ImageUrlField
                  id="i-icon"
                  label="Küçük ikon"
                  homeAnchor="Header (logo yokken)"
                  value={s.images.headerIconUrl}
                  disabled={pending}
                  onChange={(v) =>
                    setS((o) => ({ ...o, images: { ...o.images, headerIconUrl: v } }))
                  }
                />
              </div>
            ) : null}

            {activeSection === "hero" ? (
              <div className="grid max-w-xl gap-5">
                <Field id="c-tag" label="Üst etiket" homeAnchor="Kahraman · rozet">
                  <Input
                    id="c-tag"
                    value={s.copy.siteTagline}
                    onChange={(e) =>
                      setS((o) => ({ ...o, copy: { ...o.copy, siteTagline: e.target.value } }))
                    }
                    disabled={pending}
                  />
                </Field>
                <Field id="c-hero" label="Ana başlık" homeAnchor="Kahraman · H1">
                  <Input
                    id="c-hero"
                    value={s.copy.heroTitle}
                    onChange={(e) =>
                      setS((o) => ({ ...o, copy: { ...o.copy, heroTitle: e.target.value } }))
                    }
                    disabled={pending}
                  />
                </Field>
                <Field id="c-sub" label="Alt metin" homeAnchor="Kahraman · paragraf">
                  <textarea
                    id="c-sub"
                    rows={4}
                    value={s.copy.heroSubtitle}
                    onChange={(e) =>
                      setS((o) => ({ ...o, copy: { ...o.copy, heroSubtitle: e.target.value } }))
                    }
                    disabled={pending}
                    className={textareaClass}
                  />
                </Field>
                <Field
                  id="c-promo"
                  label="Kampanya kutusu"
                  homeAnchor="Kahraman · alt kutu"
                  hint="Boş bırakırsanız varsayılan kampanya metni kullanılır"
                >
                  <textarea
                    id="c-promo"
                    rows={3}
                    value={s.copy.promoBannerText ?? ""}
                    onChange={(e) =>
                      setS((o) => ({
                        ...o,
                        copy: {
                          ...o.copy,
                          promoBannerText: e.target.value.trim() ? e.target.value : null,
                        },
                      }))
                    }
                    disabled={pending}
                    className={textareaClass}
                  />
                </Field>
                <ImageUrlField
                  id="i-hero"
                  label="Kahraman banner görseli"
                  homeAnchor="Kahraman · sağ (Teeno tarzı)"
                  hint="El + telefon mockup veya şeffaf PNG; boşsa /images/hero-hand-phone.png kullanılır"
                  value={s.images.heroBackgroundUrl}
                  disabled={pending}
                  onChange={(v) =>
                    setS((o) => ({ ...o, images: { ...o.images, heroBackgroundUrl: v } }))
                  }
                />
              </div>
            ) : null}

            {activeSection === "showcase" ? (
              <div className="grid max-w-xl gap-5">
                <p className="rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  Bu görsel ana sayfada <strong className="text-foreground">Neden biz?</strong> geniş
                  alanında ve <strong className="text-foreground">Ekran görünümü</strong> bölümünde
                  kullanılır. Yatay ekran görüntüsü veya tanıtım görseli önerilir.
                </p>
                <ImageUrlField
                  id="i-og"
                  label="Vitrin / Open Graph görseli"
                  homeAnchor="Hakkında + Ekran bölümü"
                  hint="Sosyal paylaşımda da kullanılır; kahraman görseli yoksa mockup yedek olur"
                  value={s.images.ogImageUrl}
                  disabled={pending}
                  onChange={(v) =>
                    setS((o) => ({ ...o, images: { ...o.images, ogImageUrl: v } }))
                  }
                />
                <ImageUrlField
                  id="i-hero-ref"
                  label="Kahraman mockup (aynı alan)"
                  homeAnchor="Kahraman · sağ"
                  hint="Kahraman sekmesindeki alanla aynıdır"
                  value={s.images.heroBackgroundUrl}
                  disabled={pending}
                  onChange={(v) =>
                    setS((o) => ({ ...o, images: { ...o.images, heroBackgroundUrl: v } }))
                  }
                />
              </div>
            ) : null}

            {activeSection === "seo" ? (
              <div className="grid max-w-xl gap-5">
                <Field
                  id="c-meta"
                  label="Site açıklaması (SEO)"
                  homeAnchor="Meta · footer özet"
                  hint="Google sonuçları ve Open Graph açıklaması"
                >
                  <textarea
                    id="c-meta"
                    rows={3}
                    value={s.copy.metaDescription}
                    onChange={(e) =>
                      setS((o) => ({ ...o, copy: { ...o.copy, metaDescription: e.target.value } }))
                    }
                    disabled={pending}
                    className={textareaClass}
                  />
                </Field>
                <Field
                  id="c-foot"
                  label="Footer ek satırı"
                  homeAnchor="Alt bilgi (landing footer)"
                  hint="Ana sayfa çok sütunlu footer altında"
                >
                  <textarea
                    id="c-foot"
                    rows={2}
                    value={s.copy.footerLine}
                    onChange={(e) =>
                      setS((o) => ({ ...o, copy: { ...o.copy, footerLine: e.target.value } }))
                    }
                    disabled={pending}
                    className={textareaClass}
                  />
                </Field>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <aside className="lg:sticky lg:top-36">
          <Card className="shadow-sm">
            <CardContent className="pt-5">
              <SiteLookHomePreview s={s} activeSection={activeSection} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </form>
  );
}
