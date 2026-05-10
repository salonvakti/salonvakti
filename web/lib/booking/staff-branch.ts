/**
 * Personelin `branch_id` değeri null ise tüm şubelerde online randevu listesinde gösterilir.
 */
export function staffListedForBranch(
  staffBranchId: string | null | undefined,
  selectedBranchId: string | null,
  tenantHasBranches: boolean
): boolean {
  if (!tenantHasBranches) return true;
  if (!selectedBranchId) return false;
  return staffBranchId == null || staffBranchId === selectedBranchId;
}
