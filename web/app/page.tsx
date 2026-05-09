import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteFooter } from "@/components/common/SiteFooter";
import { SiteHeader } from "@/components/common/SiteHeader";
import { getLandingPackagePriceLabels } from "@/lib/landing/package-prices";
import { listPublicSalons } from "@/lib/public/salon-directory";
import { SITE_SEO_KEYWORDS } from "@/lib/seo/keywords";
import { absoluteUrl } from "@/lib/seo/site-url";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Link2,
  QrCode,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";

const homeDescription =
  "SalonVakti: kuaför, berber ve güzellik merkezleri için online randevu yazılımı. Müşterileriniz anında online randevu alsın; siz takvim ve işletme yönetimini tek panelden yürütün.";

export const metadata: Metadata = {
  title: {
    absolute:
      "SalonVakti — Online randevu yazılımı | Salon, kuaför ve güzellik merkezi randevu sistemi",
  },
  description: homeDescription,
  keywords: [...SITE_SEO_KEYWORDS],
  openGraph: {
    title: "SalonVakti — Online randevu ve salon yönetimi",
    description: homeDescription,
    locale: "tr_TR",
    type: "website",
    url: absoluteUrl("/"),
    siteName: "SalonVakti",
  },
  twitter: {
    card: "summary_large_image",
    title: "SalonVakti — Online randevu yazılımı",
    description: homeDescription,
  },
  alternates: {
    canonical: absoluteUrl("/"),
  },
  robots: { index: true, follow: true },
};

export default async function HomePage() {
  const prices = await getLandingPackagePriceLabels();
  const { salons: directorySalons } = await listPublicSalons();
  const showcaseSalons = directorySalons.slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-b from-muted/60 to-background">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl space-y-6">
              <p className="text-sm font-medium text-primary">SalonVakti Web Uygulaması</p>
              <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
                Online randevu ve salon yönetimi — tek platformda
              </h1>
              <p className="text-lg text-muted-foreground">
                <strong className="font-medium text-foreground">Online randevu</strong> alın, müşteri
                trafiğini paylaşılabilir bağlantı veya QR ile büyütün; işletmeniz talepleri onaylayarak
                takvimini kontrol etsin. Salon, kuaför ve güzellik merkezleri için tasarlandı.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/register" className={buttonVariants({ size: "lg" })}>
                  Ücretsiz dene
                </Link>
                <Link
                  href="/login"
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  Panele gir
                </Link>
              </div>
            </div>
            <Card className="max-w-md border-muted shadow-sm">
              <CardHeader>
                <CardTitle>Bugün yapabilecekleriniz</CardTitle>
                <CardDescription>Çok kiracılı yapı için hazır ekran iskeleti</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <LandingPoint icon={<QrCode className="h-5 w-5" />} text="Salonunuza özel /booking bağlantısı" />
                <LandingPoint icon={<Shield className="h-5 w-5" />} text="Rol bazlı güvenilir paneller (admin, personel, müşteri)" />
                <LandingPoint icon={<Sparkles className="h-5 w-5" />} text="Randevuları beklet / onayla / reddet" />
                <LandingPoint icon={<CheckCircle2 className="h-5 w-5" />} text="Hizmet süreleri ve ücret güncelleme ekranı" />
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="isletmeler" className="scroll-mt-16 border-b bg-background">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  Online randevu veren işletmeler
                </h2>
                <p className="text-muted-foreground">
                  Yayında olan işletmelerin tanıtım sayfalarını görün; müşteriler için{" "}
                  <span className="font-medium text-foreground">online randevu</span> bağlantısıyla doğrudan
                  rezervasyon oluşturun.
                </p>
              </div>
              <Link href="/isletmeler" className={buttonVariants({ variant: "outline" })}>
                Tümünü gör
              </Link>
            </div>
            {showcaseSalons.length === 0 ? (
              <p className="mt-8 text-sm text-muted-foreground">
                Henüz listelenecek işletme yok. Kendi işletmenizi eklemek için{" "}
                <Link href="/register" className="font-medium text-primary underline underline-offset-4">
                  kayıt olun
                </Link>
                .
              </p>
            ) : (
              <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {showcaseSalons.map((s) => (
                  <li key={s.id}>
                    <Card className="h-full border-muted/80 shadow-sm transition-shadow hover:shadow-md">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg leading-snug">
                          <Link
                            href={`/isletme/${encodeURIComponent(s.slug)}`}
                            className="hover:underline"
                          >
                            {s.name}
                          </Link>
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {s.promoText?.trim() ||
                            `${s.name} — online randevu ve işletme sayfası.`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-wrap gap-2">
                        <Link
                          href={`/isletme/${encodeURIComponent(s.slug)}`}
                          className={buttonVariants({ variant: "secondary", size: "sm" })}
                        >
                          Tanıtım
                        </Link>
                        <Link
                          href={`/booking/${encodeURIComponent(s.slug)}`}
                          className={buttonVariants({ size: "sm" })}
                        >
                          Online randevu al
                        </Link>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="border-b bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-center text-2xl font-semibold tracking-tight">Öne çıkan özellikler</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
              Randevudan personel takibine kadar günlük işlerinizi tek yerden yönetin; müşterileriniz paylaşılan
              link veya QR ile size ulaşsın.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <HighlightCard
                icon={<Link2 className="h-5 w-5" />}
                title="Paylaşılabilir randevu linki"
                body="İşletmenize özel adres ile müşteriler hizmet seçer, uygun saati bırakır; isterseniz QR ile vitrine taşıyın."
              />
              <HighlightCard
                icon={<CalendarDays className="h-5 w-5" />}
                title="Takvim ve onay akışı"
                body="Gelen talepler bekleyen durumda listelenir; onay veya red ile takviminiz güncel kalır."
              />
              <HighlightCard
                icon={<Users className="h-5 w-5" />}
                title="Personel ve roller"
                body="Yönetici tüm işletmeyi görür, personel yalnızca kendisine atanan randevuları takip eder."
              />
              <HighlightCard
                icon={<ClipboardList className="h-5 w-5" />}
                title="Hizmet ve fiyat kartları"
                body="Süre ve ücretleri tanımlayın; müşteri akışında net bilgi, işletmede tutarlı kayıt."
              />
              <HighlightCard
                icon={<Shield className="h-5 w-5" />}
                title="İşletme odaklı veri"
                body="Müşteri ve randevu detayları işletme sınırlarında kalır; sayfa kurucuları dahil hiç kimese bu kayıtlara erişmez."
              />
              <HighlightCard
                icon={<Sparkles className="h-5 w-5" />}
                title="Hızlı başlangıç"
                body="Kayıt sonrası deneme lisansı ile panele geçin; slug ve yönetici hesabı tek adımda hazırlanır."
              />
            </div>
          </div>
        </section>

        <section id="paketler" className="scroll-mt-16 border-b bg-background">
          <div className="mx-auto max-w-6xl px-4 py-16 pb-20">
            <h2 className="text-center text-2xl font-semibold tracking-tight">Paketler</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
              İşletmenizin büyüklüğüne ve hedeflerinize uygun planı seçin; tüm paketlerde çekirdek randevu ve
              salon yönetimi altyapısıyla başlarsınız.
            </p>
            <div className="mt-10 grid gap-8 lg:grid-cols-3 lg:items-stretch">
              <PackageCard
                name="Basic"
                tagline="Yeni başlayan ve tek şubeli salonlar için ideal başlangıç paketi."
                priceLabel={prices.basic}
                features={[
                  "7/24 online randevu sistemi",
                  "Müşteri kayıtları ve geçmiş işlemler",
                  "Personel yönetimi",
                  "Hizmet ve fiyat tanımlama",
                  "Salonunuza özel tanıtım sayfası",
                  "Temel gelir ve performans raporları",
                ]}
                audienceTitle="Kimler için uygun?"
                audience="Yeni açılan güzellik salonları, kuaförler ve küçük işletmeler."
              />
              <PackageCard
                name="Pro"
                tagline="Büyümek isteyen salonlar için profesyonel çözümler."
                priceLabel={prices.pro}
                features={[
                  "Basic paketteki tüm özellikler",
                  "Aylık 500 SMS gönderimi",
                  "Otomatik e-posta hatırlatmaları",
                  "2 şubeye kadar kullanım desteği",
                  "Mobil uygulama erişimi",
                  "Gelişmiş analiz ve raporlama",
                  "Personel prim / komisyon hesaplama",
                  "Sadakat programı ve müşteri puan sistemi",
                  "Google Takvim senkronizasyonu",
                  "Zapier entegrasyonu",
                  "Geliştiriciler için API erişimi",
                ]}
                audienceTitle="Kimler için uygun?"
                audience="Yoğun müşteri trafiğine sahip, büyümeyi hedefleyen salonlar ve güzellik merkezleri."
                highlighted
              />
              <PackageCard
                name="Ultimate"
                tagline="Kurumsal düzeyde yönetim ve sınırsız özellikler."
                priceLabel={prices.ultimate}
                features={[
                  "Pro paketteki tüm özellikler",
                  "Sınırsız SMS ve e-posta gönderimi",
                  "WhatsApp ve Telegram entegrasyonu",
                  "Sınırsız şube yönetimi",
                  "Yapay zekâ destekli analiz ve öneriler",
                  "Özel entegrasyon desteği",
                  "Sınırsız otomasyon altyapısı",
                  "Size özel müşteri temsilcisi",
                  "7/24 öncelikli teknik destek",
                  "Gelişmiş güvenlik altyapısı",
                ]}
                audienceTitle="Kimler için uygun?"
                audience="Zincir salonlar, franchise yapılar ve profesyonel işletmeler."
              />
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              <Link href="/register" className={buttonVariants({ size: "lg" })}>
                Ücretsiz dene
              </Link>
              <Link href="/login" className={buttonVariants({ variant: "outline", size: "lg" })}>
                Zaten hesabım var
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight">Neden SalonVakti?</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              title="Hızlı kurulum"
              body="Birkaç dakikada işletme hesabınızı açın, size özel randevu bağlantısını paylaşın ve yönetici panelinden işe başlayın."
            />
            <FeatureCard
              title="Onay süreci kontrolünde"
              body="Randevular her zaman bekleyen olarak düşer; işletmeniz onayı yönetir."
            />
            <FeatureCard
              title="Gizlilik ayrımı"
              body="Müşteri bilgileri yalnızca ilgili salon tarafından kullanılır; platform tarafı bu verileri görüntülemez veya pazarlama için işlemez."
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function LandingPoint({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-primary">{icon}</div>
      <span>{text}</span>
    </div>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{body}</CardContent>
    </Card>
  );
}

function HighlightCard({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Card className="border-muted/80 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="space-y-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <CardTitle className="text-base leading-snug">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{body}</CardContent>
    </Card>
  );
}

function PackageCard({
  name,
  tagline,
  priceLabel,
  features,
  audienceTitle,
  audience,
  highlighted,
}: {
  name: string;
  tagline: string;
  priceLabel: string;
  features: string[];
  audienceTitle: string;
  audience: string;
  highlighted?: boolean;
}) {
  return (
    <Card
      className={cn(
        "relative flex h-full min-h-0 flex-col overflow-visible shadow-sm",
        highlighted
          ? "border-primary/50 pt-7 ring-2 ring-primary/20"
          : "border-muted/80"
      )}
    >
      {highlighted ? (
        <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground shadow-sm">
          Öne çıkan
        </div>
      ) : null}
      <CardHeader className={cn("shrink-0 space-y-2", highlighted ? "pt-1" : "pt-2")}>
        <CardTitle className="text-xl">{name} Paket</CardTitle>
        <CardDescription className="text-base leading-relaxed">{tagline}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-6">
        <ul className="min-h-0 flex-1 space-y-2.5 text-sm">
          {features.map((line) => (
            <li key={line} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span className="leading-snug">{line}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto space-y-4">
          <div className="rounded-lg bg-muted/50 p-4 text-sm">
            <p className="font-medium text-foreground">{audienceTitle}</p>
            <p className="mt-2 text-muted-foreground">{audience}</p>
          </div>
          <div className="border-t border-border/80 pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Fiyat</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">{priceLabel}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
