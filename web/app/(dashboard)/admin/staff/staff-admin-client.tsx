"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createStaffMemberAction, listStaffForAdminAction, updateStaffBranchAction } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StaffRow, TenantBranchRow } from "@/lib/db-types";
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
  branches,
}: {
  initialRows: StaffRow[];
  initialListError: string | null;
  branches: TenantBranchRow[];
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
  const [newStaffBranchId, setNewStaffBranchId] = useState<string>("");
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
        branchId: newStaffBranchId.trim() || null,
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
      setNewStaffBranchId("");
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
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="sf-branch">Şube (isteğe bağlı)</Label>
              <select
                id="sf-branch"
                className="flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={newStaffBranchId}
                onChange={(e) => setNewStaffBranchId(e.target.value)}
                disabled={pending}
              >
                <option value="">Tüm şubeler</option>
                {branches
                  .filter((b) => b.is_active)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Boş bırakılırsa personel online randevuda her şubede listelenir.
              </p>
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
              <TableHead>Şube</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Hesap</TableHead>
              <TableHead>Takvim</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.display_name}</TableCell>
                <TableCell>
                  <select
                    className="flex h-9 max-w-[200px] rounded-md border border-input bg-background px-2 text-sm"
                    value={r.branch_id ?? ""}
                    disabled={pending}
                    onChange={(e) => {
                      const v = e.target.value;
                      startTransition(async () => {
                        const res = await updateStaffBranchAction({
                          staffId: r.id,
                          branchId: v.trim() || null,
                        });
                        if (!res.ok && res.error) {
                          window.alert(res.error);
                          return;
                        }
                        router.refresh();
                        const refreshed = await listStaffForAdminAction();
                        if (refreshed.error) {
                          setError(refreshed.error);
                        } else {
                          setError(null);
                          setRows(refreshed.rows);
                        }
                      });
                    }}
                  >
                    <option value="">Tüm şubeler</option>
                    {branches
                      .filter((b) => b.is_active)
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                  </select>
                </TableCell>
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
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
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
