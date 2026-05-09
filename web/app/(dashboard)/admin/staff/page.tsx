import { StaffAdminClient } from "./staff-admin-client";
import { listStaffForAdminAction } from "./actions";

export default async function AdminStaffPage() {
  const { rows, error } = await listStaffForAdminAction();

  return <StaffAdminClient initialRows={rows} initialListError={error} />;
}
