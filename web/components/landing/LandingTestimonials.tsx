import { Quote } from "lucide-react";
import { SectionHeading } from "@/components/landing/landing-shared";

const items = [
  {
    quote:
      "Müşterilerimiz artık telefon beklemiyor; paylaştığımız linkten randevu alıyorlar. Onay akışı sayesinde takvim hep düzenli.",
    name: "Ayşe K.",
    role: "Güzellik salonu sahibi",
  },
  {
    quote:
      "Personel yalnızca kendi randevularını görüyor, ben tüm işletmeyi tek panelden yönetiyorum. Kurulum birkaç dakika sürdü.",
    name: "Mehmet T.",
    role: "Berber işletmesi",
  },
  {
    quote:
      "Paket yapısı net; ihtiyacımız olan modüller açık, gereksiz özellik için fazla ödeme yapmıyoruz.",
    name: "Zeynep D.",
    role: "Kuaför zinciri yöneticisi",
  },
];

export function LandingTestimonials() {
  return (
    <section className="border-b py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          badge="Referanslar"
          title="İşletmeler ne diyor?"
          subtitle="Salon ve kuaför işletmelerinden geri bildirimler."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map((t) => (
            <blockquote
              key={t.name}
              className="relative rounded-2xl border bg-card p-6 shadow-sm"
            >
              <Quote className="mb-4 h-8 w-8 text-primary/30" aria-hidden />
              <p className="text-sm leading-relaxed text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-6 border-t pt-4">
                <p className="font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
