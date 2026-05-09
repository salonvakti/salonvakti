import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClientFavoriteSalonsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Favori salonlar</h1>
        <p className="text-muted-foreground">
          Kayıtlı favori listesi yakında hesabınıza bağlanacak. Şimdilik işletmeleri keşfetmek için dizini
          kullanabilirsiniz.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">İşletme dizini</CardTitle>
          <CardDescription>Online randevu sunan tüm işletmeleri tek listede görün.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/isletmeler" className={buttonVariants()}>
            İşletmelere git
          </Link>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Ana sayfa
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
