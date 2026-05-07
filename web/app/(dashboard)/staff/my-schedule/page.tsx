import { AppointmentCalendar } from "@/components/calendar/AppointmentCalendar";
import { demoAppointments } from "@/lib/demo-data";

export default function StaffMySchedulePage() {
  const mine = demoAppointments.filter((a) => a.staffName === "Zeynep");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Takvimim</h1>
        <p className="text-muted-foreground">İşletme personeli olarak size atanmış randevular.</p>
      </div>
      <AppointmentCalendar items={mine.length ? mine : demoAppointments} />
    </div>
  );
}
