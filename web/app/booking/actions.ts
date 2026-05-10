"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/auth/session";
import { isCustomerRole } from "@/lib/constants/roles";
import { hasStaffBookingConflict, listAvailableBookingSlots } from "@/lib/booking/availability";
import { assertBranchAndStaffForBooking, loadActiveBranchIdsForTenant } from "@/lib/booking/branch-booking-guards";
import { validateBookingWallSlot } from "@/lib/booking/slot-validation";
import type { TenantRow } from "@/lib/db-types";
import { normalizePhoneDigits } from "@/lib/phone/normalize";
import { getPublicSalonBySlug } from "@/lib/public/salon-directory";
import { normalizeTenantSlug } from "@/lib/tenant/slug";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAvailableBookingSlotsAction(input: {
  salonSlug: string;
  staffId: string;
  dateStr: string;
  serviceId: string;
  /** İşletmenin aktif şubesi varsa zorunlu */
  branchId?: string | null;
}): Promise<{ slots: string[]; error: string | null }> {
  const slug = normalizeTenantSlug(input.salonSlug);
  if (!slug) {
    return { slots: [], error: "Geçersiz işletme." };
  }

  const { salon, error: salonErr } = await getPublicSalonBySlug(slug);
  if (salonErr) {
    return { slots: [], error: salonErr };
  }
  if (!salon) {
    return { slots: [], error: "İşletme bulunamadı." };
  }

  const service = salon.services.find((s) => s.id === input.serviceId);
  if (!service) {
    return { slots: [], error: "Hizmet bulunamadı." };
  }

  if (!salon.staff.some((s) => s.id === input.staffId)) {
    return { slots: [], error: "Personel geçersiz." };
  }

  const { ids: activeBranchIds, error: brErr } = await loadActiveBranchIdsForTenant(salon.id);
  if (brErr) {
    return { slots: [], error: brErr };
  }

  const branchGate = await assertBranchAndStaffForBooking({
    tenantId: salon.id,
    staffId: input.staffId,
    branchId: input.branchId?.trim() || null,
    activeBranchIds,
  });
  if (!branchGate.ok) {
    return { slots: [], error: branchGate.error };
  }

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return { slots: [], error: null };
  }

  const { data: tenantRow } = await admin
    .from("tenants")
    .select("settings_json")
    .eq("id", salon.id)
    .maybeSingle();

  return listAvailableBookingSlots({
    tenantId: salon.id,
    staffId: input.staffId,
    dateStr: input.dateStr,
    durationMinutes: service.durationMinutes,
    settingsSource: {
      settings_json: (tenantRow?.settings_json ?? null) as TenantRow["settings_json"],
    },
  });
}

export async function createPublicBookingAction(input: {
  salonSlug: string;
  serviceId: string;
  staffId: string;
  clientName: string;
  phone: string;
  email: string | null;
  dateStr: string;
  slotHHmm: string;
  branchId?: string | null;
}): Promise<{ ok: boolean; appointmentId: string | null; error: string | null }> {
  const slug = normalizeTenantSlug(input.salonSlug);
  if (!slug) {
    return { ok: false, appointmentId: null, error: "Geçersiz işletme bağlantısı." };
  }

  const slotHHmm = input.slotHHmm.trim();
  if (!/^\d{1,2}:\d{2}$/.test(slotHHmm)) {
    return { ok: false, appointmentId: null, error: "Geçersiz saat biçimi." };
  }

  const name = input.clientName.trim();
  const phoneRaw = input.phone.trim();
  const phoneDigits = normalizePhoneDigits(phoneRaw);
  if (!name) {
    return { ok: false, appointmentId: null, error: "Ad soyad gerekli." };
  }
  if (!phoneDigits || phoneDigits.length < 10) {
    return { ok: false, appointmentId: null, error: "Geçerli bir telefon girin." };
  }

  const { salon, error: salonErr } = await getPublicSalonBySlug(slug);
  if (salonErr) {
    return { ok: false, appointmentId: null, error: salonErr };
  }
  if (!salon) {
    return { ok: false, appointmentId: null, error: "İşletme bulunamadı veya kapalı." };
  }

  const service = salon.services.find((s) => s.id === input.serviceId);
  if (!service) {
    return { ok: false, appointmentId: null, error: "Seçilen hizmet geçerli değil." };
  }

  if (!salon.staff.some((s) => s.id === input.staffId)) {
    return { ok: false, appointmentId: null, error: "Seçilen personel geçerli değil." };
  }

  const { ids: activeBranchIds, error: brErr } = await loadActiveBranchIdsForTenant(salon.id);
  if (brErr) {
    return { ok: false, appointmentId: null, error: brErr };
  }

  const branchGate = await assertBranchAndStaffForBooking({
    tenantId: salon.id,
    staffId: input.staffId,
    branchId: input.branchId?.trim() || null,
    activeBranchIds,
  });
  if (!branchGate.ok) {
    return { ok: false, appointmentId: null, error: branchGate.error };
  }

  const resolvedBranchId =
    activeBranchIds.length > 0 ? (input.branchId?.trim() || null) : null;

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return { ok: false, appointmentId: null, error: "Sunucu yapılandırması eksik." };
  }

  const { data: tenantRow, error: tenantErr } = await admin
    .from("tenants")
    .select("settings_json")
    .eq("id", salon.id)
    .maybeSingle();

  if (tenantErr || !tenantRow) {
    return { ok: false, appointmentId: null, error: tenantErr?.message ?? "İşletme ayarları okunamadı." };
  }

  const tenantPick: Pick<TenantRow, "settings_json"> = {
    settings_json: tenantRow.settings_json as TenantRow["settings_json"],
  };

  const slotValidation = validateBookingWallSlot({
    dateStr: input.dateStr,
    slotHHmm,
    durationMinutes: service.durationMinutes,
    tenant: tenantPick,
  });

  if (!slotValidation.ok) {
    return { ok: false, appointmentId: null, error: slotValidation.error };
  }

  const { start, end } = slotValidation;

  const expectedMs = service.durationMinutes * 60 * 1000;
  if (Math.abs(end.getTime() - start.getTime() - expectedMs) > 90_000) {
    return { ok: false, appointmentId: null, error: "Randevu süresi hizmet süresiyle uyuşmuyor." };
  }

  const overlap = await hasStaffBookingConflict({
    tenantId: salon.id,
    staffId: input.staffId,
    start,
    end,
  });

  if (overlap.error) {
    return { ok: false, appointmentId: null, error: overlap.error };
  }
  if (overlap.conflict) {
    return {
      ok: false,
      appointmentId: null,
      error: "Bu saat için seçilen personelde başka bir randevu var. Lütfen başka bir slot seçin.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user ?? null : null;
  const sessionProfile = user ? getSessionProfile(user) : null;

  const { data: clientCandidates, error: cErr } = await admin
    .from("clients")
    .select("id,user_id,phone")
    .eq("tenant_id", salon.id);

  if (cErr) {
    return { ok: false, appointmentId: null, error: cErr.message };
  }

  const existing = (clientCandidates ?? []).find(
    (c) => normalizePhoneDigits((c.phone as string | null) ?? "") === phoneDigits
  );

  let clientId: string;

  const emailTrim = input.email?.trim() || null;

  if (existing) {
    clientId = existing.id as string;
    const patch: Record<string, unknown> = {
      name,
      phone: phoneRaw || existing.phone,
    };
    if (emailTrim) patch.email = emailTrim;

    if (user?.id && !(existing.user_id as string | null) && sessionProfile && isCustomerRole(sessionProfile.role)) {
      patch.user_id = user.id;
    }

    const { error: upErr } = await admin.from("clients").update(patch).eq("id", clientId);
    if (upErr) {
      return { ok: false, appointmentId: null, error: upErr.message };
    }
  } else {
    const insertPayload: Record<string, unknown> = {
      tenant_id: salon.id,
      name,
      phone: phoneRaw,
      email: emailTrim,
    };
    if (user?.id && sessionProfile && isCustomerRole(sessionProfile.role)) {
      insertPayload.user_id = user.id;
    }

    const { data: inserted, error: insErr } = await admin
      .from("clients")
      .insert(insertPayload)
      .select("id")
      .single();

    if (insErr || !inserted) {
      return { ok: false, appointmentId: null, error: insErr?.message ?? "Müşteri kaydı oluşturulamadı." };
    }
    clientId = inserted.id as string;
  }

  const { data: appointment, error: apErr } = await admin
    .from("appointments")
    .insert({
      tenant_id: salon.id,
      client_id: clientId,
      staff_id: input.staffId,
      branch_id: resolvedBranchId,
      service_id: input.serviceId,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: "pending",
      price_snapshot: service.price,
    })
    .select("id")
    .single();

  if (apErr || !appointment) {
    return { ok: false, appointmentId: null, error: apErr?.message ?? "Randevu kaydedilemedi." };
  }

  const appointmentId = appointment.id as string;

  revalidatePath(`/booking/${slug}/confirmation`);
  revalidatePath("/client/my-bookings");

  return { ok: true, appointmentId, error: null };
}
