import { redirect } from "next/navigation";
import { PlatformPackagesForm } from "./platform-packages-form";
import { getSessionProfile } from "@/lib/auth/session";
import { getLandingPackagePriceLabels } from "@/lib/landing/package-prices";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function PlatformPackagesPage() {
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

  const prices = await getLandingPackagePriceLabels();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paket fiyatları</h1>
        <p className="text-muted-foreground">
          Ana sayfadaki Basic, Pro ve Ultimate kartlarının altında gösterilen fiyat metinlerini buradan
          güncelleyin. Serbest metin girebilirsiniz (ör. &quot;2.990 ₺ / ay&quot;, &quot;Teklif alın&quot;).
        </p>
      </div>
      <PlatformPackagesForm initial={prices} />
    </div>
  );
}
