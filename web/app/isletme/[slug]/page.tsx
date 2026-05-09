import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/common/SiteFooter";
import { SiteHeader } from "@/components/common/SiteHeader";
import { GoogleMapEmbed } from "@/components/public/GoogleMapEmbed";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPublicSalonBySlug } from "@/lib/public/salon-directory";
import { SITE_SEO_KEYWORDS } from "@/lib/seo/keywords";
import { absoluteUrl } from "@/lib/seo/site-url";
import { normalizeTenantSlug } from "@/lib/tenant/slug";
import { cn } from "@/lib/utils";
import { CalendarClock, MapPin, Phone } from "lucide-react";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = normalizeTenantSlug(params.slug);
  const { salon } = await getPublicSalonBySlug(slug);
  if (!salon) {
    return {
      title: "İşletme bulunamadı | SalonVakti",
      robots: { index: false, follow: true },
    };
  }

  const baseDesc =
    salon.promoText?.trim() ||
    `${salon.name} için online randevu alın. Hizmetler, adres ve iletişim bilgileri SalonVakti ile.`;
  const description = baseDesc.length > 165 ? `${baseDesc.slice(0, 162)}…` : baseDesc;

  const canonicalPath = `/isletme/${salon.slug}`;
  const url = absoluteUrl(canonicalPath);

  const title = `${salon.name} | Online randevu — SalonVakti`;

  return {
    title,
    description,
    keywords: [salon.name, "online randevu", salon.address ?? "", ...SITE_SEO_KEYWORDS].filter(
      Boolean
    ),
    openGraph: {
      title,
      description,
      url,
      locale: "tr_TR",
      type: "website",
      siteName: "SalonVakti",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
    robots: { index: true, follow: true },
  };
}

export default async function IsletmeTanitimPage({ params }: Props) {
  const slug = normalizeTenantSlug(params.slug);
  const { salon, error } = await getPublicSalonBySlug(slug);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center px-4">
          <p className="text-center text-sm text-destructive">{error}</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!salon) {
    notFound();
  }

  const bookingHref = `/booking/${encodeURIComponent(salon.slug)}`;
  const pageUrl = absoluteUrl(`/isletme/${salon.slug}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: salon.name,
    description:
      salon.promoText?.trim() ||
      `${salon.name} — SalonVakti ile online randevu ve hizmet bilgileri.`,
    url: pageUrl,
    telephone: salon.phone ?? undefined,
    address: salon.address
      ? {
          "@type": "PostalAddress",
          streetAddress: salon.address,
          addressCountry: "TR",
        }
      : undefined,
    offers: salon.services.map((s) => ({
      "@type": "Offer",
      name: s.name,
      price: s.price,
      priceCurrency: "TRY",
    })),
  };

  const fmtTry = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" });

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-b from-muted/50 to-background">
          <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
            <nav className="text-sm text-muted-foreground" aria-label="Sayfa konumu">
              <Link href="/" className="underline underline-offset-4">
                SalonVakti
              </Link>
              <span className="mx-2" aria-hidden>
                /
              </span>
              <Link href="/isletmeler" className="underline underline-offset-4">
                İşletmeler
              </Link>
              <span className="mx-2" aria-hidden>
                /
              </span>
              <span className="text-foreground">{salon.name}</span>
            </nav>

            <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl space-y-4">
                <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
                  {salon.name}
                </h1>
                <p className="text-lg font-medium text-muted-foreground">
                  Online randevu — hizmetleri inceleyin, uygun zamanda rezervasyon oluşturun.
                </p>
                <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground">
                  <p className="text-base leading-relaxed">
                    {salon.promoText?.trim() ||
                      `${salon.name}, SalonVakti üzerinden müşterilerine online randevu imkânı sunar. Aşağıdaki listeden hizmet seçerek randevu akışına geçebilirsiniz.`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href={bookingHref}
                    className={cn(buttonVariants({ size: "lg" }), "inline-flex gap-2")}
                  >
                    <CalendarClock className="h-5 w-5" aria-hidden />
                    Online randevu al
                  </Link>
                  <Link href="/isletmeler" className={buttonVariants({ variant: "outline", size: "lg" })}>
                    Tüm işletmeler
                  </Link>
                </div>
              </div>
              <aside className="w-full shrink-0 space-y-3 rounded-xl border bg-card p-5 lg:max-w-sm">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  İletişim
                </h2>
                {salon.phone ? (
                  <p className="flex gap-2 text-sm">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <a href={`tel:${salon.phone.replace(/\s/g, "")}`} className="hover:underline">
                      {salon.phone}
                    </a>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Telefon kaydı yok.</p>
                )}
                {salon.address ? (
                  <p className="flex gap-2 text-sm">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>{salon.address}</span>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Adres kaydı yok.</p>
                )}
              </aside>
            </div>
          </div>
        </section>

        {salon.address?.trim() ? (
          <section className="mx-auto max-w-6xl px-4 py-12">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight">Konum</h2>
            <p className="mb-4 max-w-3xl text-muted-foreground">
              <strong className="font-medium text-foreground">{salon.name}</strong> işletmesinin harita
              üzerindeki konumu. Ziyaret planı veya yol tarifi için Google Haritalar ile görüntüleyin.
            </p>
            <GoogleMapEmbed address={salon.address} ariaLabel={`${salon.name} konumu — Google Harita`} />
            <p className="mt-3 text-sm">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(salon.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4"
              >
                Google Maps’te aç
              </a>
            </p>
          </section>
        ) : null}

        <section className="border-t bg-muted/20 py-12">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-2xl font-semibold tracking-tight">Hizmetler ve fiyatlar</h2>
            <p className="mt-2 max-w-3xl text-muted-foreground">
              Online randevu sırasında bu hizmetlerden seçim yapabilirsiniz. Güncel süre ve ücret bilgisi
              işletme tarafından yönetilir.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {salon.services.map((svc) => (
                <li key={svc.id}>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{svc.name}</CardTitle>
                      <CardDescription>
                        {svc.durationMinutes} dk · {fmtTry.format(svc.price)}
                      </CardDescription>
                    </CardHeader>
                    {svc.description ? (
                      <CardContent className="text-sm text-muted-foreground">{svc.description}</CardContent>
                    ) : null}
                  </Card>
                </li>
              ))}
            </ul>
            {salon.services.length === 0 ? (
              <p className="mt-6 text-muted-foreground">
                Henüz yayınlanmış hizmet yok. Randevu almak için yine de{" "}
                <Link href={bookingHref} className="font-medium text-primary underline underline-offset-4">
                  online randevu
                </Link>{" "}
                sayfasını kullanabilirsiniz.
              </p>
            ) : (
              <div className="mt-10 flex justify-center">
                <Link href={bookingHref} className={buttonVariants({ size: "lg" })}>
                  Bu işletmeden online randevu al
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
