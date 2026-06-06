import { redirect } from "next/navigation";
import { AdminSmsClient } from "./admin-sms-client";
import { getSmsDashboardAction } from "./actions";

export default async function AdminSmsPage() {
  const res = await getSmsDashboardAction();

  if (!res.ok || !res.data) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">SMS</h1>
        <p className="text-sm text-destructive">{res.error ?? "Yüklenemedi."}</p>
      </div>
    );
  }

  if (res.error === "Oturum yok.") {
    redirect("/login?next=/admin/sms");
  }

  return <AdminSmsClient initial={res.data} />;
}
