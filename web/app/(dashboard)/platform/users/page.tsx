import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/session";
import { listPlatformStaffFromAuth } from "@/lib/platform/platform-auth-users";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PlatformUsersTable } from "./platform-users-table";

export default async function PlatformUsersPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/login?error=config");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const profile = getSessionProfile(user);
  if (profile?.role !== "platform_admin") {
    redirect("/platform/tenants");
  }

  const { users, error } = await listPlatformStaffFromAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform kullanıcıları</h1>
        <p className="text-muted-foreground">
          Kaynak: Supabase <strong>Authentication</strong> (auth.users). Yalnızca{" "}
          <code className="rounded bg-muted px-1 text-sm">user_metadata.role</code> değeri{" "}
          <code className="rounded bg-muted px-1 text-sm">platform_admin</code> veya{" "}
          <code className="rounded bg-muted px-1 text-sm">platform_user</code> olan hesaplar listelenir.
          Son müşteri / işletme verisi bu tabloda yoktur.
        </p>
      </div>
      <PlatformUsersTable
        users={users}
        currentUserId={user.id}
        configError={error}
      />
    </div>
  );
}
