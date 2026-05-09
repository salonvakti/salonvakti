import "server-only";

import type { AppointmentStatus } from "@/lib/db-types";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";

export type PublicAppointmentConfirmation = {
  serviceName: string;
  staffName: string | null;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
};

/**
 * Onay sayfası için randevu özeti; tenant slug ile eşleşmezse null (yanlış vitrin linklerini önler).
 */
export async function getPublicAppointmentConfirmation(
  appointmentId: string,
  salonSlug: string
): Promise<PublicAppointmentConfirmation | null> {
  const admin = createServiceRoleSupabaseClient();
  if (!admin) return null;

  const { data: appt, error: aErr } = await admin
    .from("appointments")
    .select("tenant_id,staff_id,service_id,start_time,end_time,status")
    .eq("id", appointmentId)
    .maybeSingle();

  if (aErr || !appt) return null;

  const { data: tenant, error: tErr } = await admin
    .from("tenants")
    .select("slug")
    .eq("id", appt.tenant_id as string)
    .maybeSingle();

  if (tErr || !tenant || (tenant.slug as string) !== salonSlug) {
    return null;
  }

  const serviceId = appt.service_id as string;

  const { data: svcRow } = await admin.from("services").select("name").eq("id", serviceId).maybeSingle();

  let staffName: string | null = null;
  const sid = appt.staff_id as string | null;
  if (sid) {
    const { data: st } = await admin.from("staff").select("display_name").eq("id", sid).maybeSingle();
    staffName = (st?.display_name as string | undefined) ?? null;
  }

  return {
    serviceName: (svcRow?.name as string | undefined) ?? "Hizmet",
    staffName,
    startTime: appt.start_time as string,
    endTime: appt.end_time as string,
    status: appt.status as AppointmentStatus,
  };
}
