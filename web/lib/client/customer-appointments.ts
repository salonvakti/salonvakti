import "server-only";

import type { AppointmentStatus } from "@/lib/db-types";
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
    .select(
      "id,tenant_id,staff_id,start_time,end_time,status,clients(name),services(name),staff(display_name)"
    )
    .in("client_id", ids)
    .order("start_time", { ascending: false });

  if (error) {
    return { items: [], error: error.message };
  }

  const items: AppointmentSummary[] = (data ?? []).map((item) => ({
    id: item.id as string,
    tenantId: item.tenant_id as string,
    clientName: (item.clients as { name?: string } | null)?.name ?? "Müşteri",
    serviceName: (item.services as { name?: string } | null)?.name ?? "Hizmet",
    staffName: (item.staff as { display_name?: string } | null)?.display_name ?? null,
    staffId: (item.staff_id as string | null) ?? null,
    startTime: item.start_time as string,
    endTime: item.end_time as string,
    status: item.status as AppointmentStatus,
  }));

  return { items, error: null };
}
