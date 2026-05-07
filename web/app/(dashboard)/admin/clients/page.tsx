import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const clients = [
  { id: "c1", name: "Ayşe Yılmaz", phone: "+90 532 000 00 00", email: "ayse@email.com" },
  { id: "c2", name: "Mehmet Kaya", phone: "+90 533 111 11 11", email: "mehmet@email.com" },
];

export default function AdminClientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Müşteriler</h1>
          <p className="text-muted-foreground">Kayıtlı veya manuel oluşturulmuş salon müşteri listeniz.</p>
        </div>
        <div className="flex w-full gap-2 md:w-auto">
          <Input placeholder="İsim veya telefon ara" className="md:w-64" />
          <Button>Müşteri ekle</Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>İsim</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead className="text-right">Detay</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.phone}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline">
                    Aç
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
