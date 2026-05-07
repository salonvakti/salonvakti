import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function ClientFavoriteSalonsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Favori salonlar</h1>
        <p className="text-muted-foreground">
          Yakında kullanıcı tercihlerine bağlanacak liste. Şimdilik örnek bir kart.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vintage Hair Lab</CardTitle>
          <CardDescription>İstanbul · Kadıköy</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/booking/vintage" className="text-sm font-medium text-primary underline underline-offset-4">
            Randevuya git →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
