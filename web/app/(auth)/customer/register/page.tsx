import Link from "next/link";
import { Suspense } from "react";
import { CustomerRegisterForm } from "@/components/auth/CustomerRegisterForm";
import { SiteFooter } from "@/components/common/SiteFooter";
import { SiteHeader } from "@/components/common/SiteHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomerRegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Müşteri kaydı</CardTitle>
            <CardDescription>
              Salonlardan online randevu almak ve kayıtlarınızı yönetmek için ücretsiz hesap oluşturun. İşletme
              açmak için{" "}
              <Link href="/register" className="text-primary underline underline-offset-4">
                işletme kaydı
              </Link>
              .
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<p className="text-sm text-muted-foreground">Yükleniyor…</p>}>
              <CustomerRegisterForm />
            </Suspense>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
