import { redirect } from "next/navigation";
import { PlatformMediaClient } from "./platform-media-client";
import { getSessionProfile } from "@/lib/auth/session";
import { isPlatformStaffRole } from "@/lib/constants/roles";
import { getDefaultDashboardPath } from "@/lib/auth/permissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function PlatformMediaPage() {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Medya kütüphanesi</h1>
        <p className="text-muted-foreground">
          Görseller Netlify Blobs üzerinde saklanır. URL’leri site görünümü ve vitrin alanlarında{" "}
          <strong className="font-medium">https</strong> olarak kullanabilirsiniz.
        </p>
      </div>
      <PlatformMediaClient />
    </div>
  );
}
