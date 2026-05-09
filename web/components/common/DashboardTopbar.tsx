"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SessionProfile } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/constants/roles";
import type { SupabaseClient, User } from "@supabase/supabase-js";

type Props = {
  user: User;
  profile: SessionProfile | null;
  supabase: SupabaseClient | null;
};

function avatarInitials(user: User): string {
  const m = user.user_metadata ?? {};
  const f = typeof m.first_name === "string" ? m.first_name.trim() : "";
  const l = typeof m.last_name === "string" ? m.last_name.trim() : "";
  if (f && l) return (f[0] + l[0]).toUpperCase();
  const d = typeof m.display_name === "string" ? m.display_name.trim() : "";
  if (d) {
    const parts = d.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  }
  const e = user.email ?? "";
  return (e.charAt(0) || "?").toUpperCase();
}

export function DashboardTopbar({ user, profile, supabase }: Props) {
  const router = useRouter();
  const email = user.email ?? null;
  const initial = avatarInitials(user);

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <span className="text-sm text-muted-foreground">
        {profile?.role ? ROLE_LABELS[profile.role] : "Oturum"}
      </span>
      <div className="flex items-center gap-0.5">
        <Link
          href="/account"
          className="rounded-full outline-none ring-offset-2 focus-visible:ring-2"
          aria-label="Hesap ayarları"
          title="Hesap ayarları"
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger
            type="button"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none ring-offset-2 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Menü"
          >
            <MoreHorizontal className="h-5 w-5" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>{email ?? "Kullanıcı"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => router.push("/")} className="cursor-pointer">
              Siteye dön
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => void supabase?.auth.signOut()}
              className="cursor-pointer"
            >
              Çıkış
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
