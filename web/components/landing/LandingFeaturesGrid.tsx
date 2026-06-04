import { Headphones, Layout, RefreshCw, Shield } from "lucide-react";
import { SectionHeading } from "@/components/landing/landing-shared";

const features = [
  {
    num: "01",
    icon: Layout,
    title: "Modern panel",
    body: "Takvim önizleme, randevu onayı ve raporlar tek arayüzde; personel için ayrı görünüm.",
  },
  {
    num: "02",
    icon: RefreshCw,
    title: "Kolay kurulum",
    body: "Kayıt sonrası slug ve yönetici hesabı hazır; randevu linkinizi hemen paylaşın.",
  },
  {
    num: "03",
    icon: Shield,
    title: "Güvenli yapı",
    body: "İşletme verisi kiracı bazında izole; platform kullanıcısı müşteri PII görmez.",
  },
  {
    num: "04",
    icon: Headphones,
    title: "Paket esnekliği",
    body: "Basic’ten Ultimate’e; ihtiyaca göre SMS, şube ve entegrasyon modülleri.",
  },
];

export function LandingFeaturesGrid() {
  return (
    <section id="ozellikler" className="scroll-mt-20 border-b py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          badge="Popüler özellikler"
          title="İşletmeniz için güçlü modüller"
          subtitle="Kuaför, berber ve güzellik merkezleri için uçtan uca online randevu deneyimi."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ num, icon: Icon, title, body }) => (
            <article
              key={num}
              className="group relative rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
            >
              <span className="text-4xl font-extrabold text-primary/15">{num}</span>
              <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
