import { notFound } from "next/navigation";
import { BookingCheckoutClient } from "@/components/booking/BookingCheckoutClient";
import { getSessionProfile } from "@/lib/auth/session";
import { isCustomerRole } from "@/lib/constants/roles";
import { mapPublicServicesToSummaries } from "@/lib/booking/map-services";
import { getPublicSalonBySlug } from "@/lib/public/salon-directory";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeTenantSlug } from "@/lib/tenant/slug";
import type { ServiceSummary } from "@/types/service";

type Props = { params: { salonSlug: string } };

export default async function BookingCheckoutPage({ params }: Props) {
  const slug = normalizeTenantSlug(decodeURIComponent(params.salonSlug));
  if (!slug) notFound();

  const { salon } = await getPublicSalonBySlug(slug);
  if (!salon) notFound();

  const services: ServiceSummary[] = mapPublicServicesToSummaries(salon.services);
  const branchOptions = salon.branches.map((b) => ({ id: b.id, name: b.name }));

  const supabase = await createSupabaseServerClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user ?? null : null;
  const profile = user ? getSessionProfile(user) : null;
  const isRegisteredCustomer = Boolean(user && profile && isCustomerRole(profile.role));

  return (
    <BookingCheckoutClient
      salonSlug={slug}
      salonName={salon.name}
      services={services}
      requiresBranch={salon.branches.length > 0}
      branchOptions={branchOptions}
      isRegisteredCustomer={isRegisteredCustomer}
    />
  );
}
