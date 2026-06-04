"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  ExternalLink,
  ImageIcon,
  LayoutTemplate,
  Megaphone,
  Palette,
  Save,
  Type,
} from "lucide-react";
import { savePlatformSiteSettingsAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { ResolvedPublicSiteSettings } from "@/types/public-site";

const SECTIONS = [
  { id: "theme", label: "Tema", icon: Palette },
  { id: "brand", label: "Marka", icon: Type },
  { id: "hero", label: "Ana sayfa", icon: LayoutTemplate },
  { id: "seo", label: "SEO & şerit", icon: Megaphone },
  { id: "images", label: "Görseller", icon: ImageIcon },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const textareaClass =
  "flex min-h-[88px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30";

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
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
  value,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string | null;
  onChange: (v: string | null) => void;
  disabled?: boolean;
}) {
  const url = (value ?? "").trim();
  const showPreview = url.startsWith("https://");

  return (
    <Field id={id} label={label} hint={hint}>
      <Input
        id={id}
        type="url"
        placeholder="https://..."
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value.trim() || null)}
        disabled={disabled}
      />
      {showPreview ? (
        <div className="mt-2 overflow-hidden rounded-lg border bg-muted/30 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            className="mx-auto max-h-24 max-w-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      ) : null}
    </Field>
  );
}

function SiteLookPreview({ s }: { s: ResolvedPublicSiteSettings }) {
  const primary = s.theme.primary.trim() || "var(--primary)";
  const primaryFg = s.theme.primaryForeground.trim() || "var(--primary-foreground)";

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Canlı önizleme
      </p>
      <div
        className="overflow-hidden rounded-xl border shadow-sm"
        style={
          {
            "--preview-primary": primary,
            "--preview-primary-fg": primaryFg,
          } as React.CSSProperties
        }
      >
        <div
          className="flex items-center justify-between gap-2 px-3 py-2 text-xs"
          style={{ background: primary, color: primaryFg }}
        >
          <span className="truncate font-semibold">{s.copy.siteName || "Site adı"}</span>
          <span className="opacity-80">Menü</span>
        </div>
        {s.copy.promoBannerText ? (
          <div className="border-b bg-amber-500/15 px-3 py-1.5 text-center text-[0.65rem] leading-snug text-amber-950 dark:text-amber-100">
            {s.copy.promoBannerText.slice(0, 120)}
            {s.copy.promoBannerText.length > 120 ? "…" : ""}
          </div>
        ) : null}
        <div
          className={cn(
            "space-y-2 px-4 py-6",
            s.images.heroBackgroundUrl
              ? "bg-cover bg-center text-white"
              : "bg-muted/40"
          )}
          style={
            s.images.heroBackgroundUrl
              ? {
                  backgroundImage: `linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.55)), url(${s.images.heroBackgroundUrl})`,
                }
              : undefined
          }
        >
          <p className="text-[0.65rem] font-medium uppercase tracking-wider opacity-80">
            {s.copy.siteTagline || "Üst etiket"}
          </p>
          <h3 className="text-base font-bold leading-tight">
            {s.copy.heroTitle || "Ana başlık"}
          </h3>
          <p className="line-clamp-3 text-[0.7rem] leading-relaxed opacity-90">
            {s.copy.heroSubtitle || "Alt metin önizlemesi…"}
          </p>
          <span
            className="inline-block rounded-md px-2 py-1 text-[0.65rem] font-medium"
            style={{ background: primary, color: primaryFg }}
          >
            Örnek düğme
          </span>
        </div>
        {s.copy.footerLine ? (
          <div className="border-t bg-muted/50 px-3 py-2 text-[0.65rem] text-muted-foreground">
            {s.copy.footerLine}
          </div>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-2 text-[0.65rem]">
        <div className="rounded-lg border p-2">
          <span className="text-muted-foreground">Birincil</span>
          <div className="mt-1 h-6 rounded" style={{ background: primary }} />
        </div>
        <div className="rounded-lg border p-2">
          <span className="text-muted-foreground">Vurgu</span>
          <div
            className="mt-1 h-6 rounded"
            style={{ background: s.theme.accent.trim() || "var(--muted)" }}
          />
        </div>
      </div>
    </div>
  );
}

export function PlatformSiteLookClient({ initial }: { initial: ResolvedPublicSiteSettings }) {
  const [s, setS] = useState<ResolvedPublicSiteSettings>(initial);
  const [activeSection, setActiveSection] = useState<SectionId>("theme");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const activeMeta = useMemo(
    () => SECTIONS.find((sec) => sec.id === activeSection) ?? SECTIONS[0],
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
      setMessage("Kaydedildi. Vitrin birkaç saniye içinde güncellenir.");
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
              Genel vitrin teması, metinler ve görseller. Renk: hex veya{" "}
              <code className="rounded bg-muted px-1 text-xs">oklch(...)</code> · görseller yalnızca{" "}
              <strong className="font-medium">https</strong>.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" nativeButton={false} render={<Link href="/" target="_blank" />}>
              <ExternalLink className="h-3.5 w-3.5" data-icon="inline-start" />
              Vitrini aç
            </Button>
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

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)_minmax(0,17rem)] lg:items-start">
        <nav
          className="flex gap-1 overflow-x-auto pb-1 lg:sticky lg:top-28 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:pb-0"
          aria-label="Ayar bölümleri"
        >
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSection(id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                activeSection === id
                  ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </button>
          ))}
        </nav>

        <Card className="min-w-0 shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <activeMeta.icon className="h-4 w-4 text-muted-foreground" aria-hidden />
              {activeMeta.label}
            </CardTitle>
            <CardDescription>
              {activeSection === "theme" &&
                "Vitrin renkleri ve köşe yuvarlaklığı. Boş renk alanları varsayılan temaya döner."}
              {activeSection === "brand" && "Site adı ve üst slogan; header ve tarayıcı başlığında kullanılır."}
              {activeSection === "hero" && "Ana sayfa kahraman alanı başlık ve açıklama metinleri."}
              {activeSection === "seo" &&
                "Arama motoru özeti, üst kampanya şeridi ve footer vurgusu."}
              {activeSection === "images" && (
                <>
                  Logo, ikon, kahraman arka planı ve sosyal paylaşım görseli (https).{" "}
                  <Link href="/platform/media" className="text-primary underline underline-offset-2">
                    Medya kütüphanesinden
                  </Link>{" "}
                  URL kopyalayabilirsiniz.
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            {activeSection === "theme" ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <ColorField
                  id="t-primary"
                  label="Birincil renk"
                  hint="Düğmeler ve vurgular"
                  placeholder="#4f46e5"
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
                  hint="Opsiyonel"
                  placeholder="Boş = varsayılan"
                  value={s.theme.accent}
                  disabled={pending}
                  onChange={(v) => setS((o) => ({ ...o, theme: { ...o.theme, accent: v } }))}
                />
                <ColorField
                  id="t-acf"
                  label="Vurgu yazı rengi"
                  placeholder="Opsiyonel"
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
                    hint="0–2 arası; boş bırakırsanız varsayılan kullanılır."
                  >
                    <Input
                      id="t-r"
                      type="number"
                      step="0.125"
                      min={0}
                      max={2}
                      placeholder="örn. 0.625"
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

            {activeSection === "brand" ? (
              <div className="grid max-w-xl gap-5">
                <Field id="c-name" label="Site adı">
                  <Input
                    id="c-name"
                    value={s.copy.siteName}
                    onChange={(e) =>
                      setS((o) => ({ ...o, copy: { ...o.copy, siteName: e.target.value } }))
                    }
                    disabled={pending}
                  />
                </Field>
                <Field
                  id="c-tag"
                  label="Üst etiket / slogan"
                  hint="Ana sayfa kahraman bölümünün üstündeki kısa metin"
                >
                  <Input
                    id="c-tag"
                    value={s.copy.siteTagline}
                    onChange={(e) =>
                      setS((o) => ({ ...o, copy: { ...o.copy, siteTagline: e.target.value } }))
                    }
                    disabled={pending}
                  />
                </Field>
              </div>
            ) : null}

            {activeSection === "hero" ? (
              <div className="grid max-w-xl gap-5">
                <Field id="c-hero" label="Ana başlık">
                  <Input
                    id="c-hero"
                    value={s.copy.heroTitle}
                    onChange={(e) =>
                      setS((o) => ({ ...o, copy: { ...o.copy, heroTitle: e.target.value } }))
                    }
                    disabled={pending}
                  />
                </Field>
                <Field id="c-sub" label="Alt metin">
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
              </div>
            ) : null}

            {activeSection === "seo" ? (
              <div className="grid max-w-xl gap-5">
                <Field
                  id="c-meta"
                  label="Site açıklaması (SEO)"
                  hint="Arama sonuçları ve paylaşım kartları"
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
                <Separator />
                <Field
                  id="c-promo"
                  label="Üst kampanya şeridi"
                  hint="Boş = yerleşik varsayılan metin"
                >
                  <textarea
                    id="c-promo"
                    rows={3}
                    placeholder="Boş bırakırsanız kod varsayılanını kullanır."
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
                <Field id="c-foot" label="Footer ek satırı" hint="Alt bilgi vurgu kutusu">
                  <textarea
                    id="c-foot"
                    rows={2}
                    placeholder="İsteğe bağlı"
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

            {activeSection === "images" ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <ImageUrlField
                  id="i-logo"
                  label="Geniş logo"
                  hint="Header kelime işareti"
                  value={s.images.headerLogoUrl}
                  disabled={pending}
                  onChange={(v) =>
                    setS((o) => ({ ...o, images: { ...o.images, headerLogoUrl: v } }))
                  }
                />
                <ImageUrlField
                  id="i-icon"
                  label="Küçük ikon"
                  value={s.images.headerIconUrl}
                  disabled={pending}
                  onChange={(v) =>
                    setS((o) => ({ ...o, images: { ...o.images, headerIconUrl: v } }))
                  }
                />
                <div className="sm:col-span-2">
                  <ImageUrlField
                    id="i-hero"
                    label="Kahraman arka plan görseli"
                    value={s.images.heroBackgroundUrl}
                    disabled={pending}
                    onChange={(v) =>
                      setS((o) => ({ ...o, images: { ...o.images, heroBackgroundUrl: v } }))
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <ImageUrlField
                    id="i-og"
                    label="Open Graph görseli"
                    hint="Sosyal medya paylaşım önizlemesi"
                    value={s.images.ogImageUrl}
                    disabled={pending}
                    onChange={(v) =>
                      setS((o) => ({ ...o, images: { ...o.images, ogImageUrl: v } }))
                    }
                  />
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <aside className="lg:sticky lg:top-28">
          <Card className="shadow-sm">
            <CardContent className="pt-5">
              <SiteLookPreview s={s} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </form>
  );
}
