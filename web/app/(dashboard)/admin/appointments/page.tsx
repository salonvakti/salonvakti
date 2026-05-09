import { AdminAppointmentsClient } from "./admin-appointments-client";
import { listAppointmentsForTenantAdminAction } from "./actions";

export default async function AdminAppointmentsPage() {
  const { items, staffOptions, error } = await listAppointmentsForTenantAdminAction();

  return (
    <AdminAppointmentsClient
      initialAppointments={items}
      initialStaffOptions={staffOptions}
      initialListError={error}
    />
  );
}
