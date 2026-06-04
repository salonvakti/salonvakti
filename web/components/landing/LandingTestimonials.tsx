import { SectionHeading } from "@/components/landing/landing-shared";
import { GoogleReviewsCarousel } from "@/components/landing/GoogleReviewsCarousel";
import type { GoogleMapsReview } from "@/types/public-site";

const FALLBACK: GoogleMapsReview[] = [
  {
    authorName: "Ayşe K.",
    rating: 5,
    text: "Müşterilerimiz artık telefon beklemiyor; paylaştığımız linkten randevu alıyorlar. Onay akışı sayesinde takvim hep düzenli.",
    relativeTime: "",
    profilePhotoUrl: null,
  },
  {
    authorName: "Mehmet T.",
    rating: 5,
    text: "Personel yalnızca kendi randevularını görüyor, ben tüm işletmeyi tek panelden yönetiyorum. Kurulum birkaç dakika sürdü.",
    relativeTime: "",
    profilePhotoUrl: null,
  },
  {
    authorName: "Zeynep D.",
    rating: 5,
    text: "Paket yapısı net; ihtiyacımız olan modüller açık, gereksiz özellik için fazla ödeme yapmıyoruz.",
    relativeTime: "",
    profilePhotoUrl: null,
  },
];

type Props = {
  reviews: GoogleMapsReview[];
  mapsUrl: string | null;
  rating: number | null;
  reviewCount: number | null;
};

export function LandingTestimonials({ reviews, mapsUrl, rating, reviewCount }: Props) {
  const fromGoogle = reviews.length > 0;
  const display = fromGoogle ? reviews : FALLBACK;

  return (
    <section className="border-b py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          badge="Referanslar"
          title="İşletmeler ne diyor?"
          subtitle={
            fromGoogle
              ? "Google Haritalar üzerinden alınan gerçek müşteri yorumları."
              : "Salon ve kuaför işletmelerinden geri bildirimler."
          }
        />

        <div className="mt-14">
          <GoogleReviewsCarousel
            reviews={display}
            mapsUrl={fromGoogle ? mapsUrl : null}
            rating={fromGoogle ? rating : null}
            reviewCount={fromGoogle ? reviewCount : null}
          />
        </div>

        {!fromGoogle ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Google yorumlarını göstermek için platform yöneticisi panelinde{" "}
            <span className="font-medium text-foreground">Google yorumları</span> bölümünden
            Haritalar bağlantınızı kaydedin.
          </p>
        ) : null}
      </div>
    </section>
  );
}
