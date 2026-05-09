import Link from "next/link";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteFooter } from "@/components/common/SiteFooter";
import { SiteHeader } from "@/components/common/SiteHeader";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Link2,
  QrCode,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-b from-muted/60 to-background">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl space-y-6">
              <p className="text-sm font-medium text-primary">SalonVakti SaaS</p>
              <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
                Salonunuz için hızlı online randevu ve takip
              </h1>
              <p className="text-lg text-muted-foreground">
                İşletme bazlı paylaşım linki veya QR kod ile müşteriler dakikalar içinde randevu bıraksın,
                işletmeniz bekleyen istekleri onaylayarak takviminizi yönetsin.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/register" className={buttonVariants({ size: "lg" })}>
                  Ücretsiz dene
                </Link>
                <Link
                  href="/login"
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  Panele gir
                </Link>
              </div>
            </div>
            <Card className="max-w-md border-muted shadow-sm">
              <CardHeader>
                <CardTitle>Bugün yapabilecekleriniz</CardTitle>
                <CardDescription>Çok kiracılı yapı için hazır ekran iskeleti</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <LandingPoint icon={<QrCode className="h-5 w-5" />} text="Salonunuza özel /booking bağlantısı" />
                <LandingPoint icon={<Shield className="h-5 w-5" />} text="Rol bazlı güvenilir paneller (admin, personel, müşteri)" />
                <LandingPoint icon={<Sparkles className="h-5 w-5" />} text="Randevuları beklet / onayla / reddet" />
                <LandingPoint icon={<CheckCircle2 className="h-5 w-5" />} text="Hizmet süreleri ve ücret güncelleme ekranı" />
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="border-b bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-center text-2xl font-semibold tracking-tight">Öne çıkan özellikler</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
              Randevudan personel takibine kadar günlük işlerinizi tek yerden yönetin; müşterileriniz paylaşılan
              link veya QR ile size ulaşsın.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <HighlightCard
                icon={<Link2 className="h-5 w-5" />}
                title="Paylaşılabilir randevu linki"
                body="İşletmenize özel adres ile müşteriler hizmet seçer, uygun saati bırakır; isterseniz QR ile vitrine taşıyın."
              />
              <HighlightCard
                icon={<CalendarDays className="h-5 w-5" />}
                title="Takvim ve onay akışı"
                body="Gelen talepler bekleyen durumda listelenir; onay veya red ile takviminiz güncel kalır."
              />
              <HighlightCard
                icon={<Users className="h-5 w-5" />}
                title="Personel ve roller"
                body="Yönetici tüm işletmeyi görür, personel yalnızca kendisine atanan randevuları takip eder."
              />
              <HighlightCard
                icon={<ClipboardList className="h-5 w-5" />}
                title="Hizmet ve fiyat kartları"
                body="Süre ve ücretleri tanımlayın; müşteri akışında net bilgi, işletmede tutarlı kayıt."
              />
              <HighlightCard
                icon={<Shield className="h-5 w-5" />}
                title="İşletme odaklı veri"
                body="Müşteri ve randevu detayları kiracı sınırlarında kalır; platform ekibi bu kayıtlara erişmez."
              />
              <HighlightCard
                icon={<Sparkles className="h-5 w-5" />}
                title="Hızlı başlangıç"
                body="Kayıt sonrası deneme lisansı ile panele geçin; slug ve yönetici hesabı tek adımda hazırlanır."
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight">Neden SalonVakti?</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              title="Hızlı kurulum"
              body="Birkaç dakikada işletme hesabınızı açın, size özel randevu bağlantısını paylaşın ve yönetici panelinden işe başlayın."
            />
            <FeatureCard
              title="Onay süreci kontrolünde"
              body="Randevular her zaman bekleyen olarak düşer; işletmeniz onayı yönetir."
            />
            <FeatureCard
              title="Gizlilik ayrımı"
              body="Müşteri bilgileri yalnızca ilgili salon tarafından kullanılır; platform tarafı bu verileri görüntülemez veya pazarlama için işlemez."
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function LandingPoint({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-primary">{icon}</div>
      <span>{text}</span>
    </div>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{body}</CardContent>
    </Card>
  );
}

function HighlightCard({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Card className="border-muted/80 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="space-y-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <CardTitle className="text-base leading-snug">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{body}</CardContent>
    </Card>
  );
}
