import { StatsCards } from "@/components/dashboard/StatsCards";
import { AppointmentCalendar } from "@/components/calendar/AppointmentCalendar";
import { demoAppointments } from "@/lib/demo-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">İşletme özeti</h1>
        <p className="text-muted-foreground">Bugünün randevuları ve hızlı metrikler.</p>
      </div>
      <StatsCards
        stats={[
          { label: "Bugün bekleyen randevu", value: "3", hint: "Onay gerektirir" },
          { label: "Aktif müşteri", value: "124" },
          { label: "Bu ay cirosu (demo)", value: "₺18.400" },
        ]}
      />
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Liste</TabsTrigger>
          <TabsTrigger value="calendar">Takvim önizleme</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <AppointmentCalendar items={demoAppointments} title="Bugünkü randevular" />
        </TabsContent>
        <TabsContent value="calendar">
          <p className="text-sm text-muted-foreground">
            Tam takvim bileşeni için FullCalendar veya benzeri kütüphane eklenebilir. Şimdilik liste görünümünü kullanın.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
