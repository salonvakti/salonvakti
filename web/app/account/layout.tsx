import { DashboardShell } from "@/components/common/DashboardShell";
import { getDashboardSessionOrRedirect } from "@/lib/auth/get-dashboard-session";

/**
 * Lisans süresi dolmuş işletmeler bile hesap (şifre / iletişim) güncelleyebilsin diye
 * bu rota `(dashboard)` yerine burada; lisans kontrolü yok.
 */
export default async function AccountLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user, profile } = await getDashboardSessionOrRedirect();

  return <DashboardShell user={user} profile={profile}>{children}</DashboardShell>;
}
