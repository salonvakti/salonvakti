import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const rows = [{ name: "Ayşe Yılmaz", lastVisit: "2 gün önce", phone: "+90 532 000 0000" }];

export default function StaffMyClientsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Müşterilerim</h1>
        <p className="text-muted-foreground">
          Kendi takvimde çalıştığınız müşteri kayıtları (personel filtresine göre gelecek Supabase verisi).
        </p>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>İsim</TableHead>
              <TableHead>Son görülme</TableHead>
              <TableHead>Telefon</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.name}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>{r.lastVisit}</TableCell>
                <TableCell>{r.phone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
