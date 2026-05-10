"use client";

import { useState, useTransition } from "react";
import { savePlatformSiteSettingsAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ResolvedPublicSiteSettings } from "@/types/public-site";

export function PlatformSiteLookClient({ initial }: { initial: ResolvedPublicSiteSettings }) {
  const [s, setS] = useState<ResolvedPublicSiteSettings>(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const res = await savePlatformSiteSettingsAction(s);
      if (!res.ok) {
        setError(res.error ?? "Kayıt başarısız.");
        return;
      }
      setMessage("Ayarlar kaydedildi. Vitrin birkaç saniye içinde güncellenir.");
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Site görünümü</h1>
        <p className="text-muted-foreground">
          Genel vitrin teması, metinler ve görsel URL’leri. Renkler için hex (#4f46e5) veya{" "}
          <code className="rounded bg-muted px-1 text-xs">oklch(...)</code> kullanabilirsiniz. Görseller için yalnızca{" "}
          <strong className="font-medium">https</strong> adresleri kabul edilir.
        </p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

      <Tabs defaultValue="theme" className="w-full">
        <TabsList variant="line" className="mb-6 w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="theme">Tema</TabsTrigger>
          <TabsTrigger value="copy">Metinler</TabsTrigger>
          <TabsTrigger value="images">Görseller</TabsTrigger>
        </TabsList>

        <TabsContent value="theme" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="t-primary">Birincil renk</Label>
              <Input
                id="t-primary"
                placeholder="#4f46e5"
                value={s.theme.primary}
                onChange={(e) => setS((o) => ({ ...o, theme: { ...o.theme, primary: e.target.value } }))}
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-pf">Birincil üzeri yazı rengi</Label>
              <Input
                id="t-pf"
                placeholder="#ffffff"
                value={s.theme.primaryForeground}
                onChange={(e) =>
                  setS((o) => ({ ...o, theme: { ...o.theme, primaryForeground: e.target.value } }))
                }
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-ac">Vurgu (accent)</Label>
              <Input
                id="t-ac"
                placeholder="opsiyonel"
                value={s.theme.accent}
                onChange={(e) => setS((o) => ({ ...o, theme: { ...o.theme, accent: e.target.value } }))}
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-acf">Vurgu yazı rengi</Label>
              <Input
                id="t-acf"
                placeholder="opsiyonel"
                value={s.theme.accentForeground}
                onChange={(e) =>
                  setS((o) => ({ ...o, theme: { ...o.theme, accentForeground: e.target.value } }))
                }
                disabled={pending}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="t-r">Köşe yuvarlaklığı (rem, 0–2; boş = varsayılan)</Label>
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
                    theme: {
                      ...o.theme,
                      radiusRem: v === "" ? -1 : Number(v),
                    },
                  }));
                }}
                disabled={pending}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="copy" className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="c-name">Site adı</Label>
              <Input
                id="c-name"
                value={s.copy.siteName}
                onChange={(e) => setS((o) => ({ ...o, copy: { ...o.copy, siteName: e.target.value } }))}
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-tag">Üst etiket / slogan (ana sayfa kahraman üstü)</Label>
              <Input
                id="c-tag"
                value={s.copy.siteTagline}
                onChange={(e) => setS((o) => ({ ...o, copy: { ...o.copy, siteTagline: e.target.value } }))}
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-hero">Ana sayfa ana başlık</Label>
              <Input
                id="c-hero"
                value={s.copy.heroTitle}
                onChange={(e) => setS((o) => ({ ...o, copy: { ...o.copy, heroTitle: e.target.value } }))}
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-sub">Ana sayfa alt metin</Label>
              <textarea
                id="c-sub"
                rows={4}
                value={s.copy.heroSubtitle}
                onChange={(e) => setS((o) => ({ ...o, copy: { ...o.copy, heroSubtitle: e.target.value } }))}
                disabled={pending}
                className="flex min-h-[100px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-meta">Site açıklaması (SEO / paylaşım özeti)</Label>
              <textarea
                id="c-meta"
                rows={3}
                value={s.copy.metaDescription}
                onChange={(e) =>
                  setS((o) => ({ ...o, copy: { ...o.copy, metaDescription: e.target.value } }))
                }
                disabled={pending}
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-promo">Üst kampanya şeridi (boş = kod varsayılanı)</Label>
              <textarea
                id="c-promo"
                rows={3}
                placeholder="Boş bırakırsanız yerleşik kampanya metni kullanılır."
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
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-foot">Footer ek satırı</Label>
              <textarea
                id="c-foot"
                rows={2}
                placeholder="İsteğe bağlı; vitrin alt bilgisinde vurgulu kutu."
                value={s.copy.footerLine}
                onChange={(e) => setS((o) => ({ ...o, copy: { ...o.copy, footerLine: e.target.value } }))}
                disabled={pending}
                className="flex min-h-[60px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="i-logo">Kelime işareti / geniş logo URL</Label>
              <Input
                id="i-logo"
                type="url"
                placeholder="https://..."
                value={s.images.headerLogoUrl ?? ""}
                onChange={(e) =>
                  setS((o) => ({
                    ...o,
                    images: { ...o.images, headerLogoUrl: e.target.value || null },
                  }))
                }
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="i-icon">Küçük ikon URL</Label>
              <Input
                id="i-icon"
                type="url"
                placeholder="https://..."
                value={s.images.headerIconUrl ?? ""}
                onChange={(e) =>
                  setS((o) => ({
                    ...o,
                    images: { ...o.images, headerIconUrl: e.target.value || null },
                  }))
                }
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="i-hero">Ana sayfa kahraman arka plan görseli</Label>
              <Input
                id="i-hero"
                type="url"
                placeholder="https://..."
                value={s.images.heroBackgroundUrl ?? ""}
                onChange={(e) =>
                  setS((o) => ({
                    ...o,
                    images: { ...o.images, heroBackgroundUrl: e.target.value || null },
                  }))
                }
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="i-og">Open Graph görseli</Label>
              <Input
                id="i-og"
                type="url"
                placeholder="https://..."
                value={s.images.ogImageUrl ?? ""}
                onChange={(e) =>
                  setS((o) => ({
                    ...o,
                    images: { ...o.images, ogImageUrl: e.target.value || null },
                  }))
                }
                disabled={pending}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Button type="button" onClick={() => void save()} disabled={pending}>
        {pending ? "Kaydediliyor…" : "Kaydet"}
      </Button>
    </div>
  );
}
