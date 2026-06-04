import Link from "next/link";
import { Check, Play } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading, WideShowcaseImage } from "@/components/landing/landing-shared";

const points = [
  "İşletmenize özel online randevu bağlantısı ve QR",
  "Randevuları onaylayın; takvim her zaman güncel kalsın",
  "Personel, hizmet ve müşteri tek panelde",
  "Çok kiracılı yapı — veriler salon sınırında kalır",
];

type Props = {
  siteName: string;
  showcaseImageUrl: string | null;
};

export function LandingWhyChoose({ siteName, showcaseImageUrl }: Props) {
  return (
    <section id="hakkimizda" className="scroll-mt-20 border-b bg-muted/30 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-8">
            <SectionHeading
              center={false}
              badge="Neden bizi seçmelisiniz?"
              title={`${siteName} ile işletmenizi büyütün`}
              subtitle="Randevu, personel ve müşteri yönetimini tek platformda toplayın; müşterileriniz paylaşılan linkten saniyeler içinde randevu alsın."
            />
            <ul className="space-y-4">
              {points.map((text) => (
                <li key={text} className="flex gap-3 text-sm md:text-base">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <Link href="/register" className={buttonVariants({ size: "lg" })}>
                Hemen kayıt ol
              </Link>
              <Link
                href="/isletmeler"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                <Play className="h-4 w-4" data-icon="inline-start" />
                İşletmeleri gör
              </Link>
            </div>
          </div>
          <WideShowcaseImage
            imageUrl={showcaseImageUrl}
            alt={`${siteName} panel önizlemesi`}
          />
        </div>
      </div>
    </section>
  );
}
