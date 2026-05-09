"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createStaffMemberAction, listStaffForAdminAction } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StaffRow } from "@/lib/db-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function StaffAdminClient({
  initialRows,
  initialListError,
}: {
  initialRows: StaffRow[];
  initialListError: string | null;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<StaffRow[]>(initialRows);
  const [error, setError] = useState<string | null>(initialListError);
  const [showForm, setShowForm] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [teamRole, setTeamRole] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setRows(initialRows);
    setError(initialListError);
  }, [initialRows, initialListError]);

  function submitCreate() {
    startTransition(async () => {
      const result = await createStaffMemberAction({
        displayName,
        teamRole: teamRole.trim() || null,
        color,
        email,
        password,
      });
      if (!result.ok && result.error) {
        window.alert(result.error);
        return;
      }
      setShowForm(false);
      setDisplayName("");
      setTeamRole("");
      setColor("#6366f1");
      setEmail("");
      setPassword("");
      router.refresh();
      const refreshed = await listStaffForAdminAction();
      if (refreshed.error) {
        setError(refreshed.error);
      } else {
        setError(null);
        setRows(refreshed.rows);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personel</h1>
          <p className="text-muted-foreground">
            Personel kaydı ve giriş hesabı oluşturun; atanmış randevular takvimde görünür.
          </p>
        </div>
        <Button type="button" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Formu kapat" : "Yeni personel"}
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {showForm ? (
        <div className="space-y-4 rounded-lg border bg-card p-4">
          <h2 className="text-lg font-semibold">Yeni personel + hesap</h2>
          <p className="text-sm text-muted-foreground">
            Oluşturulan kullanıcı <strong>business_user</strong> rolü ve{" "}
            <code className="rounded bg-muted px-1 text-xs">staff_id</code> ile giriş yapar.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sf-name">Görünen ad</Label>
              <Input
                id="sf-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={pending}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sf-role">İşletme içi rol (isteğe bağlı)</Label>
              <Input
                id="sf-role"
                placeholder="örn. Usta"
                value={teamRole}
                onChange={(e) => setTeamRole(e.target.value)}
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sf-color">Takvim rengi</Label>
              <Input
                id="sf-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={pending}
              />
            </div>
            <div className="space-y-2 sm:col-span-2 border-t pt-4">
              <p className="text-sm font-medium">Giriş bilgileri</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sf-email">E-posta</Label>
              <Input
                id="sf-email"
                type="email"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={pending}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sf-pass">Şifre</Label>
              <Input
                id="sf-pass"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={pending}
                minLength={6}
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={() => void submitCreate()} disabled={pending}>
              {pending ? "Kaydediliyor..." : "Personeli oluştur"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={pending}>
              İptal
            </Button>
          </div>
        </div>
      ) : null}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Hesap</TableHead>
              <TableHead>Takvim</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.display_name}</TableCell>
                <TableCell>{r.team_role ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={r.user_id ? "default" : "secondary"}>
                    {r.user_id ? "Giriş açık" : "Hesap yok"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span
                    className="inline-flex h-3 w-12 rounded-full border"
                    style={{ backgroundColor: r.color ?? "#ccc" }}
                  />
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                  Henüz personel yok.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
