"use client";

import { useTransition } from "react";
import { updatePlatformUserRoleAction } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PlatformAuthUserRow } from "@/lib/platform/platform-auth-users";

const statusLabel: Record<PlatformAuthUserRow["status"], string> = {
  active: "Aktif",
  pending: "E-posta bekliyor",
  banned: "Engelli",
};

type Props = {
  users: PlatformAuthUserRow[];
  currentUserId: string;
  configError: string | null;
};

export function PlatformUsersTable({ users, currentUserId, configError }: Props) {
  const [pending, startTransition] = useTransition();

  function onRoleChange(userId: string, role: "platform_admin" | "platform_user") {
    startTransition(async () => {
      const result = await updatePlatformUserRoleAction(userId, role);
      if (!result.ok && result.error) {
        window.alert(result.error);
      }
    });
  }

  if (configError) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        {configError}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Auth veritabanında <code className="rounded bg-muted px-1">platform_admin</code> veya{" "}
        <code className="rounded bg-muted px-1">platform_user</code> rolü olan kullanıcı yok. Supabase
        Authentication → Users üzerinden kullanıcı oluşturup{" "}
        <code className="rounded bg-muted px-1">user_metadata.role</code> alanını ayarlayın.
      </p>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>E-posta</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead className="text-right">İşlem</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => {
            const isSelf = u.id === currentUserId;
            return (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.email ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{u.role}</Badge>
                </TableCell>
                <TableCell>{statusLabel[u.status]}</TableCell>
                <TableCell className="text-right">
                  {isSelf ? (
                    <span className="text-xs text-muted-foreground">Mevcut oturum</span>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pending || u.role === "platform_user"}
                        onClick={() => onRoleChange(u.id, "platform_user")}
                      >
                        Platform kullanıcı yap
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={pending || u.role === "platform_admin"}
                        onClick={() => onRoleChange(u.id, "platform_admin")}
                      >
                        Yönetici yap
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
