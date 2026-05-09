import { notFound } from "next/navigation";
import { BookingCheckoutClient } from "@/components/booking/BookingCheckoutClient";
import { mapPublicServicesToSummaries } from "@/lib/booking/map-services";
import { getPublicSalonBySlug } from "@/lib/public/salon-directory";
import { normalizeTenantSlug } from "@/lib/tenant/slug";
import type { ServiceSummary } from "@/types/service";

type Props = { params: { salonSlug: string } };

export default async function BookingCheckoutPage({ params }: Props) {
  const slug = normalizeTenantSlug(decodeURIComponent(params.salonSlug));
  if (!slug) notFound();

  const { salon } = await getPublicSalonBySlug(slug);
  if (!salon) notFound();

  const services: ServiceSummary[] = mapPublicServicesToSummaries(salon.services);

  return <BookingCheckoutClient salonSlug={slug} salonName={salon.name} services={services} />;
}
