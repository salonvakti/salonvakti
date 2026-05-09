import Link from "next/link";
import { redirect } from "next/navigation";
import { AppointmentCalendar } from "@/components/calendar/AppointmentCalendar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listCustomerAppointments } from "@/lib/client/customer-appointments";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function sortAppointmentsByUpcoming<T extends { startTime: string }>(items: T[]): T[] {
  const now = Date.now();
  return [...items].sort((a, b) => {
    const aTime = new Date(a.startTime).getTime();
    const bTime = new Date(b.startTime).getTime();
    const aFuture = aTime >= now;
    const bFuture = bTime >= now;
    if (aFuture && bFuture) return aTime - bTime;
    if (aFuture && !bFuture) return -1;
    if (!aFuture && bFuture) return 1;
    return bTime - aTime;
  });
}

export default async function ClientMyBookingsPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/login?error=config");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { items: rawItems, error } = await listCustomerAppointments(user.id);
  const items = sortAppointmentsByUpcoming(rawItems);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Randevularım</h1>
        <p className="text-muted-foreground">
          İşletmelerdeki müşteri kaydınız oturumunuzla eşleştiğinde randevularınız burada listelenir.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive">
          Randevular yüklenemedi: {error}. Sunucu yapılandırması veya veritabanı politikalarını kontrol edin.
        </p>
      ) : null}

      {!error && items.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Henüz randevu yok</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Bir işletmeden online randevu aldığınızda ve işletme tarafında kaydınız sizin e-posta /
              hesabınızla ilişkilendirildiğinde randevular burada görünür.
            </p>
            <Link href="/isletmeler" className={buttonVariants({ variant: "outline", size: "sm" })}>
              İşletmelere göz at
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {!error && items.length > 0 ? (
        <AppointmentCalendar items={items} title="Geçmiş ve bekleyen" />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bilgilendirme</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Randevu tamamen işletme panelinde oluşturulduysa ve müşteri kaydınızda kullanıcı bağlantısı yoksa
          liste boş kalabilir.
        </CardContent>
      </Card>
    </div>
  );
}
