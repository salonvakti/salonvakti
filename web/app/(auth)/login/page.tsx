import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";
import { SiteFooter } from "@/components/common/SiteFooter";
import { SiteHeader } from "@/components/common/SiteHeader";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Giriş</CardTitle>
            <CardDescription>
              Hesabınız yok mu?{" "}
              <Link href="/register" className="text-primary underline underline-offset-4">
                İşletme oluştur
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<p className="text-sm text-muted-foreground">Yükleniyor…</p>}>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
