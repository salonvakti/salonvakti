import Link from "next/link";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/common/SiteFooter";
import { SiteHeader } from "@/components/common/SiteHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE_SEO_KEYWORDS } from "@/lib/seo/keywords";
import { absoluteUrl } from "@/lib/seo/site-url";
import { listPublicSalons } from "@/lib/public/salon-directory";
import { MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "İşletmeler | Online randevu veren salonlar — SalonVakti",
  description:
    "Online randevu alabileceğiniz kuaför, güzellik merkezi ve salonları listeleyin. SalonVakti ile dijital randevu ve işletme sayfaları.",
  keywords: [...SITE_SEO_KEYWORDS, "işletme listesi", "salon bul"],
  openGraph: {
    title: "İşletmeler — SalonVakti online randevu",
    description:
      "Online randevu sunan işletmeleri keşfedin; her işletme için tanıtım sayfası ve randevu bağlantısı.",
    locale: "tr_TR",
    type: "website",
    url: absoluteUrl("/isletmeler"),
  },
  alternates: {
    canonical: absoluteUrl("/isletmeler"),
  },
  robots: { index: true, follow: true },
};

export default async function IsletmelerPage() {
  const { salons, error } = await listPublicSalons();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
            <nav className="text-sm text-muted-foreground" aria-label="Sayfa konumu">
              <Link href="/" className="underline underline-offset-4">
                SalonVakti
              </Link>
              <span className="mx-2" aria-hidden>
                /
              </span>
              <span className="text-foreground">İşletmeler</span>
            </nav>
            <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight md:text-4xl">
              Online randevu veren işletmeler
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
              SalonVakti üzerinde aktif olan işletmelerin tanıtım sayfalarına gidin,{" "}
              <strong className="font-medium text-foreground">online randevu</strong> bağlantısıyla hemen
              rezervasyon oluşturun.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          {error ? (
            <p className="text-sm text-destructive">
              Liste şu an yüklenemedi. Lütfen daha sonra tekrar deneyin.
            </p>
          ) : null}

          {!error && salons.length === 0 ? (
            <p className="text-muted-foreground">
              Henüz yayında işletme bulunmuyor. İşletmenizi eklemek için{" "}
              <Link href="/register" className="underline underline-offset-4">
                kayıt olun
              </Link>
              .
            </p>
          ) : null}

          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {salons.map((s) => (
              <li key={s.id}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl leading-snug">
                      <Link
                        href={`/isletme/${encodeURIComponent(s.slug)}`}
                        className="hover:underline"
                      >
                        {s.name}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {s.promoText?.trim() ||
                        `${s.name} — online randevu ve salon tanıtım sayfası.`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    {s.address ? (
                      <p className="flex gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                        <span>{s.address}</span>
                      </p>
                    ) : null}
                    {s.phone ? (
                      <p className="flex gap-2">
                        <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                        <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="hover:underline">
                          {s.phone}
                        </a>
                      </p>
                    ) : null}
                    <Link
                      href={`/isletme/${encodeURIComponent(s.slug)}`}
                      className="inline-block pt-2 text-sm font-medium text-primary hover:underline"
                    >
                      Tanıtım ve online randevu →
                    </Link>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
