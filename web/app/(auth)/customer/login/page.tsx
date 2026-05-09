import Link from "next/link";
import { Suspense } from "react";
import { CustomerLoginForm } from "@/components/auth/CustomerLoginForm";
import { SiteFooter } from "@/components/common/SiteFooter";
import { SiteHeader } from "@/components/common/SiteHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomerLoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Müşteri girişi</CardTitle>
            <CardDescription>
              Randevularınızı takip etmek için giriş yapın. İşletme yöneticisiyseniz{" "}
              <Link href="/login" className="text-primary underline underline-offset-4">
                işletme girişi
              </Link>{" "}
              kullanın.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<p className="text-sm text-muted-foreground">Yükleniyor…</p>}>
              <CustomerLoginForm />
            </Suspense>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
