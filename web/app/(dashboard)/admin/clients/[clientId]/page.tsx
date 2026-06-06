import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminClientDetailView } from "./admin-client-detail-view";
import { buttonVariants } from "@/components/ui/button";
import { getSessionProfile } from "@/lib/auth/session";
import { getAdminClientDetail } from "@/lib/clients/admin-client-detail";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Props = { params: { clientId: string } };

export default async function AdminClientDetailPage({ params }: Props) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/login?error=config");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/admin/clients");
  }

  const profile = getSessionProfile(user);
  if (profile?.role !== "business_admin" || !profile.tenantId) {
    redirect("/admin/dashboard");
  }

  const { detail, error } = await getAdminClientDetail(profile.tenantId, params.clientId);

  if (error || !detail) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Müşteri detayı</h1>
        <p className="text-sm text-destructive">{error ?? "Kayıt bulunamadı."}</p>
        <Link href="/admin/clients" className={buttonVariants({ variant: "outline" })}>
          Listeye dön
        </Link>
      </div>
    );
  }

  return <AdminClientDetailView detail={detail} />;
}
