import { AdminDashboardClient } from "./admin-dashboard-client";
import { listAppointmentsForTenantAdminAction } from "../appointments/actions";

export default async function AdminDashboardPage() {
  const { items, error } = await listAppointmentsForTenantAdminAction();

  return <AdminDashboardClient initialAppointments={items} initialListError={error} />;
}
