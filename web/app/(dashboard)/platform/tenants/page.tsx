import { redirect } from "next/navigation";
import { PlatformTenantsClient } from "./platform-tenants-client";
import { getSessionProfile } from "@/lib/auth/session";
import { isPlatformStaffRole } from "@/lib/constants/roles";
import { getDefaultDashboardPath } from "@/lib/auth/permissions";
import { listFeaturedTenantOrders } from "@/lib/platform/featured-tenants";
import { listTenantsForPlatform } from "@/lib/platform/tenant-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function PlatformTenantsPage() {
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
  if (!profile || !isPlatformStaffRole(profile.role)) {
    redirect(getDefaultDashboardPath(profile?.role ?? "customer"));
  }

  const { tenants, error } = await listTenantsForPlatform();
  const featuredOrders = await listFeaturedTenantOrders();
  const canManage = profile.role === "platform_admin";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">İşletmeler</h1>
          <p className="text-muted-foreground">
            Kiracı meta verisi ve süre bazlı lisans. Müşteri kişisel verisi bu ekranda yoktur.
          </p>
        </div>
      </div>

      <PlatformTenantsClient
        tenants={tenants}
        featuredOrders={featuredOrders}
        canManage={canManage}
        configError={error}
      />
    </div>
  );
}
