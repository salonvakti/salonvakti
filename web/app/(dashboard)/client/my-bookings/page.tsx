import { AppointmentCalendar } from "@/components/calendar/AppointmentCalendar";
import { demoAppointments } from "@/lib/demo-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClientMyBookingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Randevularım</h1>
        <p className="text-muted-foreground">
          Yeni randevular her zaman işletme onayına düşer; burada son durumlarınızı görürsünüz.
        </p>
      </div>
      <AppointmentCalendar items={demoAppointments} title="Geçmiş ve bekleyen" />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bilgilendirme</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Onaylı müşteri statüsünde geçmiş seans fotoğraf ve notları (Storage + tablo bağlantıları) görünecek şekilde
          genişletilecek.
        </CardContent>
      </Card>
    </div>
  );
}
