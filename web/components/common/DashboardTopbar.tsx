"use client";

import { useRouter } from "next/navigation";
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
import type { SupabaseClient } from "@supabase/supabase-js";

type Props = {
  email: string | null;
  profile: SessionProfile | null;
  supabase: SupabaseClient | null;
};

export function DashboardTopbar({ email, profile, supabase }: Props) {
  const router = useRouter();
  const initial = (email?.charAt(0) ?? "?").toUpperCase();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <span className="text-sm text-muted-foreground">
        {profile?.role ? ROLE_LABELS[profile.role] : "Oturum"}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-full outline-none ring-offset-2 focus-visible:ring-2">
          <Avatar>
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
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
    </header>
  );
}
