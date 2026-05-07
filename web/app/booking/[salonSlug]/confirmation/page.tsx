import { BookingConfirmationClient } from "@/components/booking/BookingConfirmationClient";

type Props = { params: { salonSlug: string } };

export default function BookingConfirmationPage({ params }: Props) {
  const salonSlug = decodeURIComponent(params.salonSlug);
  return <BookingConfirmationClient salonSlug={salonSlug} />;
}
