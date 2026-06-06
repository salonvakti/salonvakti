import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading, WideShowcaseImage } from "@/components/landing/landing-shared";

const flowSteps = [
  {
    title: "İşletmenizi kurun",
    body: "Kayıt olun; personel, hizmet süreleri ve çalışma saatlerini panelden tanımlayın. Salonunuza özel randevu sayfanız anında hazır olur.",
  },
  {
    title: "Müşteriler randevu alsın",
    body: "Paylaşılan link veya QR kod ile müşterileriniz uygun gün ve saati seçerek online randevu talebi oluşturur — ek uygulama gerekmez.",
  },
  {
    title: "Tek panelden yönetin",
    body: "Talepleri onaylayın, takvimi güncelleyin; hatırlatmalar ve raporlar paketinize göre otomatik işler. Tüm süreç tarayıcıdan yürür.",
  },
];

type Props = {
  siteName: string;
  howItWorksImageUrl: string | null;
};

export function LandingAppShowcase({ siteName, howItWorksImageUrl }: Props) {
  return (
    <section id="sistem" className="scroll-mt-20 border-b bg-gradient-to-b from-muted/40 to-background py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-8">
            <SectionHeading
              center={false}
              badge="Sistem nasıl çalışır?"
              title={`${siteName} ile randevu akışı`}
              subtitle="Kayıttan müşteri randevusuna kadar tüm süreç tek platformda; işletme ve müşteri tarafı birbirine bağlı çalışır."
            />
            <ol className="space-y-5">
              {flowSteps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold tracking-tight">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/register" className={buttonVariants({ size: "lg" })}>
              Ücretsiz deneyin
              <ArrowRight className="h-4 w-4" data-icon="inline-end" />
            </Link>
          </div>
          <WideShowcaseImage
            imageUrl={howItWorksImageUrl}
            alt={`${siteName} — sistem nasıl çalışır`}
            emptyHint="Platform → Site görünümü → Vitrin görselleri bölümünden «Sistem nasıl çalışır» görseli ekleyin."
          />
        </div>
      </div>
    </section>
  );
}
