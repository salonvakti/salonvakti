/** Randevu – domain modeli */

import type { AppointmentStatus } from "@/lib/db-types";

export interface AppointmentSummary {
  id: string;
  tenantId: string;
  clientName: string;
  serviceName: string;
  staffName: string | null;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
}
