import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const rows = [
  { id: "1", name: "Zeynep K.", role: "Usta", color: "#10b981", user: "Kayıtlı" },
  { id: "2", name: "Ali T.", role: "Kıdemli", color: "#6366f1", user: "Davetli" },
];

export default function AdminStaffPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personel</h1>
          <p className="text-muted-foreground">Personel hesaplarını ve görünürlüğü yönetin.</p>
        </div>
        <Button>Yeni personel</Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Hesap</TableHead>
              <TableHead>Takvim</TableHead>
              <TableHead className="text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>{r.role}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{r.user}</Badge>
                </TableCell>
                <TableCell>
                  <span className="inline-flex h-3 w-12 rounded-full border" style={{ backgroundColor: r.color }} />
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline">
                    Düzenle
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
