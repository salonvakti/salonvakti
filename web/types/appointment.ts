/** Randevu – domain modeli */

import type { AppointmentCompanionType, AppointmentStatus } from "@/lib/db-types";

export interface AppointmentSummary {
  id: string;
  tenantId: string;
  clientName: string;
  serviceName: string;
  staffName: string | null;
  staffId: string | null;
  /** Şube kaydı yoksa veya eski randevuda null */
  branchName: string | null;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  /** Yanında eşlik eden misafir (kayıtlı müşteri randevuları) */
  companionType: AppointmentCompanionType | null;
}
