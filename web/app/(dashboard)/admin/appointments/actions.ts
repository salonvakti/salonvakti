"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/auth/session";
import { isBusinessRole } from "@/lib/constants/roles";
import type { AppointmentSummary } from "@/types/appointment";
import type { AppointmentStatus } from "@/lib/db-types";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const appointmentSelect =
  "id,tenant_id,staff_id,branch_id,start_time,end_time,status,clients(name),services(name),staff(display_name),tenant_branches(name)";

function mapAppointmentRows(data: unknown[] | null): AppointmentSummary[] {
  return (data ?? []).map((item) => {
    const row = item as Record<string, unknown>;
    return {
      id: row.id as string,
      tenantId: row.tenant_id as string,
      clientName: (row.clients as { name?: string } | null)?.name ?? "Müşteri",
      serviceName: (row.services as { name?: string } | null)?.name ?? "Hizmet",
      staffName: (row.staff as { display_name?: string } | null)?.display_name ?? null,
      staffId: (row.staff_id as string | null) ?? null,
      branchName: (row.tenant_branches as { name?: string } | null)?.name ?? null,
      startTime: row.start_time as string,
      endTime: row.end_time as string,
      status: row.status as AppointmentStatus,
    };
  });
}

/** İşletme paneli: tarayıcıdaki anon/RLS sorgusu boş dönse bile liste sunucudan gelir. */
export async function listAppointmentsForTenantAdminAction(): Promise<{
  items: AppointmentSummary[];
  staffOptions: { id: string; display_name: string }[];
  error: string | null;
}> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { items: [], staffOptions: [], error: "Oturum yapılandırması eksik." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { items: [], staffOptions: [], error: "Oturum yok." };
  }

  const profile = getSessionProfile(user);
  if (!profile || !isBusinessRole(profile.role) || !profile.tenantId) {
    return { items: [], staffOptions: [], error: "Bu sayfa için işletme hesabı gerekli." };
  }

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return {
      items: [],
      staffOptions: [],
      error: "Sunucu yapılandırması eksik: SUPABASE_SERVICE_ROLE_KEY gerekli.",
    };
  }

  const tenantId = profile.tenantId;

  const [apRes, stRes] = await Promise.all([
    admin
      .from("appointments")
      .select(appointmentSelect)
      .eq("tenant_id", tenantId)
      .order("start_time", { ascending: true }),
    admin
      .from("staff")
      .select("id,display_name")
      .eq("tenant_id", tenantId)
      .order("display_name", { ascending: true }),
  ]);

  if (apRes.error) {
    return { items: [], staffOptions: [], error: apRes.error.message };
  }

  const staffOptions = stRes.error
    ? []
    : ((stRes.data ?? []) as { id: string; display_name: string }[]);

  return {
    items: mapAppointmentRows(apRes.data),
    staffOptions,
    error: null,
  };
}

const adminModerationStatuses: AppointmentStatus[] = ["confirmed", "cancelled_by_business"];

/** Yalnızca beklemedeki randevular onaylanır veya işletme tarafından reddedilir. */
export async function updateAppointmentStatusAdminAction(input: {
  appointmentId: string;
  status: AppointmentStatus;
}): Promise<{ ok: boolean; error: string | null }> {
  if (!adminModerationStatuses.includes(input.status)) {
    return { ok: false, error: "Bu işlem türü panelden yapılamaz." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, error: "Oturum yapılandırması eksik." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Oturum yok." };
  }

  const profile = getSessionProfile(user);
  if (!profile || !isBusinessRole(profile.role) || !profile.tenantId) {
    return { ok: false, error: "Bu işlem için işletme hesabı gerekli." };
  }

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return { ok: false, error: "Sunucu yapılandırması eksik." };
  }

  const { data, error } = await admin
    .from("appointments")
    .update({ status: input.status })
    .eq("id", input.appointmentId)
    .eq("tenant_id", profile.tenantId)
    .eq("status", "pending")
    .select("id");

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data?.length) {
    return {
      ok: false,
      error:
        "Bu randevu güncellenemedi. Yalnızca «beklemede» durumundaki talepler onaylanabilir veya reddedilebilir.",
    };
  }

  revalidatePath("/admin/appointments");
  revalidatePath("/admin/dashboard");
  return { ok: true, error: null };
}
