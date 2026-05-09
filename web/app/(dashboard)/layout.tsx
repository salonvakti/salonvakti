import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/common/DashboardShell";
import { getDashboardSessionOrRedirect } from "@/lib/auth/get-dashboard-session";
import { isBusinessRole } from "@/lib/constants/roles";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { isTenantLicenseActive } from "@/lib/tenant/license";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user, profile } = await getDashboardSessionOrRedirect();

  if (
    profile &&
    isBusinessRole(profile.role) &&
    profile.tenantId
  ) {
    const admin = createServiceRoleSupabaseClient();
    if (admin) {
      const { data: tenant } = await admin
        .from("tenants")
        .select("license_start_at, license_end_at")
        .eq("id", profile.tenantId)
        .maybeSingle();

      if (
        tenant &&
        !isTenantLicenseActive({
          license_start_at: tenant.license_start_at as string | null,
          license_end_at: tenant.license_end_at as string | null,
        })
      ) {
        redirect("/license-expired");
      }
    }
  }

  return (
    <DashboardShell user={user} profile={profile}>
      {children}
    </DashboardShell>
  );
}
