import "server-only";

import {
  APPOINTMENT_SUMMARY_SELECT,
  mapAppointmentSummaryRow,
} from "@/lib/appointments/map-summary";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import type { AppointmentSummary } from "@/types/appointment";

/**
 * Oturumdaki kullanıcının (clients.user_id) randevuları.
 * Service role ile okunur; filtre yalnızca bu kullanıcıya bağlı client kayıtlarıyla sınırlıdır.
 */
export async function listCustomerAppointments(userId: string): Promise<{
  items: AppointmentSummary[];
  error: string | null;
}> {
  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return { items: [], error: null };
  }

  const { data: clientRows, error: cErr } = await admin
    .from("clients")
    .select("id")
    .eq("user_id", userId);

  if (cErr) {
    return { items: [], error: cErr.message };
  }

  const ids = (clientRows ?? []).map((r) => r.id as string);
  if (ids.length === 0) {
    return { items: [], error: null };
  }

  const { data, error } = await admin
    .from("appointments")
    .select(APPOINTMENT_SUMMARY_SELECT)
    .in("client_id", ids)
    .order("start_time", { ascending: false });

  if (error) {
    return { items: [], error: error.message };
  }

  const items: AppointmentSummary[] = (data ?? []).map((item) =>
    mapAppointmentSummaryRow(item as Record<string, unknown>)
  );

  return { items, error: null };
}
