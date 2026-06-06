import { parseAppointmentCompanionType } from "@/lib/booking/companion";
import type { AppointmentStatus } from "@/lib/db-types";
import type { AppointmentSummary } from "@/types/appointment";

export const APPOINTMENT_SUMMARY_SELECT =
  "id,tenant_id,staff_id,branch_id,start_time,end_time,status,companion_type,clients(name),services(name),staff(display_name),tenant_branches(name)";

export function mapAppointmentSummaryRow(item: Record<string, unknown>): AppointmentSummary {
  return {
    id: item.id as string,
    tenantId: item.tenant_id as string,
    clientName: (item.clients as { name?: string } | null)?.name ?? "Müşteri",
    serviceName: (item.services as { name?: string } | null)?.name ?? "Hizmet",
    staffName: (item.staff as { display_name?: string } | null)?.display_name ?? null,
    staffId: (item.staff_id as string | null) ?? null,
    branchName: (item.tenant_branches as { name?: string } | null)?.name ?? null,
    startTime: item.start_time as string,
    endTime: item.end_time as string,
    status: item.status as AppointmentStatus,
    companionType: parseAppointmentCompanionType(item.companion_type as string | null),
  };
}
