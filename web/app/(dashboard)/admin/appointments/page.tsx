import { AppointmentCalendar } from "@/components/calendar/AppointmentCalendar";
import { Button } from "@/components/ui/button";
import { demoAppointments } from "@/lib/demo-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminAppointmentsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Randevular</h1>
          <p className="text-muted-foreground">Bekleyen istekleri onaylayın veya reddedin.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" type="button">
            Filtreler
          </Button>
          <Button type="button">Yeni randevu</Button>
        </div>
      </div>
      <AppointmentCalendar items={demoAppointments} />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Müşteri</TableHead>
              <TableHead>Hizmet</TableHead>
              <TableHead>Zaman</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {demoAppointments.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.clientName}</TableCell>
                <TableCell>{a.serviceName}</TableCell>
                <TableCell>{new Date(a.startTime).toLocaleString("tr-TR")}</TableCell>
                <TableCell>{a.status}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="secondary">
                    Onayla
                  </Button>
                  <Button size="sm" variant="outline">
                    Reddet
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
