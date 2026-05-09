import { notFound } from "next/navigation";
import { BookingConfirmationClient } from "@/components/booking/BookingConfirmationClient";
import { mapPublicServicesToSummaries } from "@/lib/booking/map-services";
import { getPublicAppointmentConfirmation } from "@/lib/booking/public-confirmation";
import { getPublicSalonBySlug } from "@/lib/public/salon-directory";
import { normalizeTenantSlug } from "@/lib/tenant/slug";
import type { ServiceSummary } from "@/types/service";

type Props = {
  params: { salonSlug: string };
  searchParams: { rid?: string };
};

export default async function BookingConfirmationPage({ params, searchParams }: Props) {
  const slug = normalizeTenantSlug(decodeURIComponent(params.salonSlug));
  if (!slug) notFound();

  const { salon } = await getPublicSalonBySlug(slug);
  if (!salon) notFound();

  const services: ServiceSummary[] = mapPublicServicesToSummaries(salon.services);

  const rid = typeof searchParams.rid === "string" ? searchParams.rid.trim() : "";
  const serverConfirmation =
    rid.length > 0 ? await getPublicAppointmentConfirmation(rid, slug) : null;

  return (
    <BookingConfirmationClient
      salonSlug={slug}
      salonName={salon.name}
      services={services}
      serverConfirmation={serverConfirmation}
    />
  );
}
