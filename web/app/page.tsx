import Link from "next/link";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteFooter } from "@/components/common/SiteFooter";
import { SiteHeader } from "@/components/common/SiteHeader";
import { CheckCircle2, QrCode, Shield, Sparkles } from "lucide-react";

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

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight">Neden SalonVakti?</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              title="Hızlı kurulum"
              body="İşletme oluştur, slug üret, ilk yöneticin hemen oturabilirsin."
            />
            <FeatureCard
              title="Onay süreci kontrolünde"
              body="Randevular her zaman bekleyen olarak düşer; işletmeniz onayı yönetir."
            />
            <FeatureCard
              title="Gizlilik ayrımı"
              body="Platform kullanıcıları müşteri PII görmez; doğrulanmış erişim RLS ile sağlanır."
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
