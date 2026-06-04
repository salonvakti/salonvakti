import Link from "next/link";
import { SectionHeading } from "@/components/landing/landing-shared";

const steps = [
  {
    num: "01",
    title: "Kayıt olun",
    body: "İşletme bilgilerinizi girin; slug ve yönetici paneli anında hazır.",
    href: "/register",
  },
  {
    num: "02",
    title: "Hizmetleri tanımlayın",
    body: "Personel, hizmet süreleri ve çalışma saatlerini panelden ayarlayın.",
    href: "/register",
  },
  {
    num: "03",
    title: "Linki paylaşın",
    body: "Salonunuza özel randevu sayfasını müşterilerinize gönderin veya QR kullanın.",
    href: "/isletmeler",
  },
  {
    num: "04",
    title: "Randevuları yönetin",
    body: "Onaylayın, takvimi güncelleyin; hatırlatmalar paketinize göre otomatik gider.",
    href: "/login",
  },
];

export function LandingHowItWorks() {
  return (
    <section className="slnvkt-how-steps border-b bg-background py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          badge="Nasıl çalışır?"
          title="Dört adımda online randevuya geçin"
          subtitle="Kurulumdan müşteri randevusuna kadar tüm süreç tek platformda."
        />
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <Link
              key={step.num}
              href={step.href}
              className="group rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="step-num">{step.num}</p>
              <h3 className="mt-3 text-lg font-bold tracking-tight group-hover:text-[var(--slnvkt-secondary,#de4313)]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
