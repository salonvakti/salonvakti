import { SectionHeading, WideShowcaseImage } from "@/components/landing/landing-shared";

type Props = {
  siteName: string;
  screenImageUrl: string | null;
};

export function LandingAppShowcase({ siteName, screenImageUrl }: Props) {
  return (
    <section className="border-b bg-gradient-to-b from-muted/40 to-background py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          badge="Ekran görünümü"
          title={`${siteName} panelini keşfedin`}
          subtitle="Takvim önizleme, randevu listesi ve işletme özeti — hepsi tarayıcıdan, ek uygulama gerekmeden."
        />
        <div className="mt-12">
          <WideShowcaseImage
            imageUrl={screenImageUrl}
            alt={`${siteName} arayüz ekran görüntüsü`}
          />
        </div>
      </div>
    </section>
  );
}
