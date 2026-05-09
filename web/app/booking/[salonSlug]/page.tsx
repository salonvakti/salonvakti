import { SiteFooter } from "@/components/common/SiteFooter";
import { SiteHeader } from "@/components/common/SiteHeader";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingSalonClient } from "@/components/booking/BookingSalonClient";
import { mapPublicServicesToSummaries } from "@/lib/booking/map-services";
import { getPublicSalonBySlug } from "@/lib/public/salon-directory";
import { absoluteUrl } from "@/lib/seo/site-url";
import { normalizeTenantSlug } from "@/lib/tenant/slug";

type Props = { params: { salonSlug: string } };

function prettyNameFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = normalizeTenantSlug(decodeURIComponent(params.salonSlug));
  const { salon } = await getPublicSalonBySlug(slug);
  const label = salon?.name ?? (slug ? prettyNameFromSlug(slug) : "Salon");
  const title = `${label} | Online randevu — SalonVakti`;
  const description = salon?.promoText?.trim()
    ? salon.promoText.trim().slice(0, 160)
    : `${label} için online randevu oluşturun. SalonVakti ile hızlı rezervasyon.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: slug ? absoluteUrl(`/booking/${slug}`) : undefined,
      locale: "tr_TR",
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default async function BookingSalonPage({ params }: Props) {
  const slug = normalizeTenantSlug(decodeURIComponent(params.salonSlug));
  if (!slug) notFound();

  const { salon } = await getPublicSalonBySlug(slug);
  if (!salon) {
    notFound();
  }

  const prettyName = salon.name;
  const services = mapPublicServicesToSummaries(salon.services);
  const staffOptions = salon.staff.map((s) => ({
    id: s.id,
    displayName: s.displayName,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="border-b bg-muted/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10">
          <p className="text-sm text-muted-foreground">
            <Link href="/" className="underline underline-offset-4">
              SalonVakti
            </Link>{" "}
            /{" "}
            <Link href={`/isletme/${encodeURIComponent(slug)}`} className="underline underline-offset-4">
              {prettyName}
            </Link>{" "}
            / online randevu
          </p>
        </div>
      </div>
      <BookingSalonClient salonSlug={slug} salonName={prettyName} services={services} staffOptions={staffOptions} />
      <SiteFooter />
    </div>
  );
}
