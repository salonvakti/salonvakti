"use client";

import type { User } from "@supabase/supabase-js";
import type { SessionProfile } from "@/lib/auth/session";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { DashboardTopbar } from "@/components/common/DashboardTopbar";
import { useSupabaseContext } from "@/components/providers/supabase-provider";

type Props = {
  user: User;
  profile: SessionProfile | null;
  children: React.ReactNode;
};

export function DashboardShell({ user, profile, children }: Props) {
  const { client } = useSupabaseContext();
  const role = profile?.role ?? "customer";

  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar email={user.email ?? null} profile={profile} supabase={client} />
        <main className="flex-1 space-y-6 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
