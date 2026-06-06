"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { SessionProfile } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/constants/roles";
import type { User } from "@supabase/supabase-js";

type Props = {
  user: User;
  profile: SessionProfile | null;
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

export function DashboardTopbar({ user, profile }: Props) {
  const initial = avatarInitials(user);

  return (
    <header className="slnvkt-topbar flex h-14 items-center justify-between border-b px-4">
      <span className="text-sm font-medium text-white/90">
        {profile?.role ? ROLE_LABELS[profile.role] : "Oturum"}
      </span>
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
    </header>
  );
}
