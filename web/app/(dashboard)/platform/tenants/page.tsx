import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";

/** Platform kullanıcıları için işletme listesi — müşteri PII içermez. */
const tenants = [
  { id: "t1", name: "Demo Salonları", slug: "demo", plan: "Pro", status: "active" as const },
  { id: "t2", name: "Vintage Hair", slug: "vintage", plan: "Basic", status: "inactive" as const },
];

export default function PlatformTenantsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">İşletmeler</h1>
          <p className="text-muted-foreground">
            Platform kullanıcıları yalnızca tenant-meta veriyi görür; müşteri listeleri görünmez (RLS + UI).
          </p>
        </div>
        <Link href="#" className={buttonVariants()}>
          Yeni işletme
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>İşletme</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">{t.slug}</code>
                </TableCell>
                <TableCell>{t.plan}</TableCell>
                <TableCell>
                  <Badge variant={t.status === "active" ? "default" : "secondary"}>
                    {t.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline">
                    Yönet
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
