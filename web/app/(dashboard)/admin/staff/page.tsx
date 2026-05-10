import { listBranchesForBusinessAction } from "../settings/branches-actions";
import { StaffAdminClient } from "./staff-admin-client";
import { listStaffForAdminAction } from "./actions";

export default async function AdminStaffPage() {
  const [{ rows, error }, branchRes] = await Promise.all([
    listStaffForAdminAction(),
    listBranchesForBusinessAction(),
  ]);

  return (
    <StaffAdminClient
      initialRows={rows}
      initialListError={error}
      branches={branchRes.error ? [] : branchRes.rows}
    />
  );
}
