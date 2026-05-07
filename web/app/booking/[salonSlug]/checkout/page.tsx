import { BookingCheckoutClient } from "@/components/booking/BookingCheckoutClient";

type Props = { params: { salonSlug: string } };

export default function BookingCheckoutPage({ params }: Props) {
  const salonSlug = decodeURIComponent(params.salonSlug);
  return <BookingCheckoutClient salonSlug={salonSlug} />;
}
