import {
  ImageIcon,
  LayoutTemplate,
  Megaphone,
  Menu,
  Palette,
} from "lucide-react";

export const SITE_LOOK_SECTIONS = [
  {
    id: "theme",
    label: "Tema",
    icon: Palette,
    homeBlock: "Tüm vitrin",
    description: "Birincil renk, vurgu ve köşe yuvarlaklığı — kahraman, düğmeler ve istatistik bandı.",
  },
  {
    id: "header",
    label: "Header",
    icon: Menu,
    homeBlock: "Üst menü",
    description: "Site adı, masaüstü ve mobil logo; tüm sayfalarda yapışkan header.",
  },
  {
    id: "hero",
    label: "Kahraman",
    icon: LayoutTemplate,
    homeBlock: "Ana sayfa üstü",
    description: "Etiket, başlık, alt metin, kampanya kutusu ve telefon mockup görseli.",
  },
  {
    id: "showcase",
    label: "Vitrin görselleri",
    icon: ImageIcon,
    homeBlock: "Hakkında + Sistem",
    description: "«Neden biz?» vitrin görseli ve «Sistem nasıl çalışır» bölümü için ayrı görseller.",
  },
  {
    id: "seo",
    label: "SEO & footer",
    icon: Megaphone,
    homeBlock: "Alt bilgi",
    description: "Arama motoru özeti, Open Graph metni ve footer ek satırı.",
  },
] as const;

export type SectionId = (typeof SITE_LOOK_SECTIONS)[number]["id"];

/** Ana sayfadaki görsel öncelik sırası (page.tsx ile aynı) */
export function resolveHeroMockupUrl(s: {
  images: { heroBackgroundUrl: string | null; ogImageUrl: string | null };
}): string | null {
  return s.images.heroBackgroundUrl?.trim() || s.images.ogImageUrl?.trim() || null;
}

export function resolveWideShowcaseUrl(s: {
  images: { heroBackgroundUrl: string | null; ogImageUrl: string | null };
}): string | null {
  return s.images.ogImageUrl?.trim() || s.images.heroBackgroundUrl?.trim() || null;
}

export function resolveHowItWorksImageUrl(s: {
  images: { howItWorksImageUrl: string | null };
}): string | null {
  return s.images.howItWorksImageUrl?.trim() || null;
}
