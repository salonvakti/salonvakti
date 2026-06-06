import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCompanionLabel } from "@/lib/booking/companion";
import {
  clientTierMeta,
  getClientDisplayTier,
} from "@/lib/clients/client-tier-display";
import type { AdminClientDetail } from "@/lib/clients/admin-client-detail";
import type { AppointmentStatus } from "@/lib/db-types";

const statusLabels: Record<AppointmentStatus, string> = {
  pending: "Beklemede",
  confirmed: "Onaylı",
  cancelled_by_business: "İşletme reddetti",
  cancelled_by_client: "Müşteri iptal etti",
  completed: "Tamamlandı",
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatConsent(iso: string | null): string {
  if (!iso) return "Onay yok";
  return formatDateTime(iso);
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b py-3 last:border-0 sm:grid-cols-[10rem_1fr]">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value ?? "—"}</dd>
    </div>
  );
}

export function AdminClientDetailView({ detail }: { detail: AdminClientDetail }) {
  const { client, accountProfile, appointments } = detail;
  const tier = getClientDisplayTier({
    business_approved_at: client.businessApprovedAt,
    phone_verified_at: client.phoneVerifiedAt,
  });
  const meta = clientTierMeta[tier];
  const inviteActive =
    client.inviteToken &&
    client.inviteExpiresAt &&
    new Date(client.inviteExpiresAt).getTime() > Date.now();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Link
            href="/admin/clients"
            className={buttonVariants({ variant: "ghost", size: "sm", className: "-ml-2 gap-1" })}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Müşterilere dön
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
            <Badge className={meta.badgeClass}>{meta.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Kayıt: {formatDateTime(client.createdAt)}
            {client.userId ? " · Hesap bağlı" : " · Hesap bağlı değil"}
          </p>
        </div>
        <Link href="/admin/appointments" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Randevulara git
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>İletişim</CardTitle>
            <CardDescription>Bu işletmedeki müşteri kaydı</CardDescription>
          </CardHeader>
          <CardContent>
            <dl>
              <DetailRow label="Ad soyad" value={client.name} />
              <DetailRow label="Telefon" value={client.phone} />
              <DetailRow label="E-posta" value={client.email} />
              <DetailRow label="İşletme notu" value={client.note} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kayıt durumu</CardTitle>
            <CardDescription>Onay ve hesap bağlantısı</CardDescription>
          </CardHeader>
          <CardContent>
            <dl>
              <DetailRow
                label="İşletme onayı"
                value={client.businessApprovedAt ? formatDateTime(client.businessApprovedAt) : "Bekliyor"}
              />
              <DetailRow
                label="Telefon onayı"
                value={client.phoneVerifiedAt ? formatDateTime(client.phoneVerifiedAt) : "—"}
              />
              <DetailRow label="Hesap bağlantısı" value={client.userId ? "Bağlı" : "Yok"} />
              <DetailRow
                label="Davet"
                value={
                  client.userId
                    ? "—"
                    : inviteActive
                      ? `Aktif (son: ${formatDateTime(client.inviteExpiresAt!)})`
                      : "Yok / süresi dolmuş"
                }
              />
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sağlık ve profil bilgileri</CardTitle>
          <CardDescription>
            {client.userId
              ? "Müşteri hesabına bağlı global profil"
              : "Hesap bağlanmadığı için sağlık profili görüntülenemiyor"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!client.userId || !accountProfile ? (
            <p className="text-sm text-muted-foreground">
              {!client.userId
                ? "Davet bağlantısı ile hesap bağlandığında doğum tarihi, alerjen ve diğer profil alanları burada görünür."
                : "Müşteri henüz profil bilgilerini doldurmamış."}
            </p>
          ) : (
            <dl>
              <DetailRow label="Doğum tarihi" value={formatDate(accountProfile.birthDate)} />
              <DetailRow label="Alerjen durumu" value={accountProfile.allergenStatus} />
              <DetailRow label="Düzenli ilaçlar" value={accountProfile.regularMedications} />
              <DetailRow
                label="Kronik rahatsızlık / hamilelik"
                value={accountProfile.chronicConditionPregnancy}
              />
              <DetailRow label="Cilt / saç tipi" value={accountProfile.skinHairType} />
            </dl>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Onaylar</CardTitle>
          <CardDescription>KVKK, ticari ileti ve hizmet öncesi onaylar</CardDescription>
        </CardHeader>
        <CardContent>
          {!client.userId || !accountProfile ? (
            <p className="text-sm text-muted-foreground">—</p>
          ) : (
            <dl>
              <DetailRow label="KVKK / açık rıza" value={formatConsent(accountProfile.kvkkConsentAt)} />
              <DetailRow
                label="Ticari elektronik ileti (İYS)"
                value={formatConsent(accountProfile.commercialConsentAt)}
              />
              <DetailRow
                label="Hizmet öncesi onay"
                value={formatConsent(accountProfile.serviceRiskConsentAt)}
              />
            </dl>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Randevu geçmişi</CardTitle>
          <CardDescription>
            Bu işletmede toplam {appointments.length} randevu kaydı
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {appointments.length === 0 ? (
            <p className="px-6 py-4 text-sm text-muted-foreground">Henüz randevu yok.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Hizmet</TableHead>
                  <TableHead>Personel</TableHead>
                  <TableHead>Şube</TableHead>
                  <TableHead>Misafir</TableHead>
                  <TableHead>Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatDateTime(a.startTime)}
                    </TableCell>
                    <TableCell>{a.serviceName}</TableCell>
                    <TableCell>{a.staffName ?? "—"}</TableCell>
                    <TableCell>{a.branchName ?? "—"}</TableCell>
                    <TableCell>{formatCompanionLabel(a.companionType) ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{statusLabels[a.status]}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
