import "server-only";

import {
  APPOINTMENT_SUMMARY_SELECT,
  mapAppointmentSummaryRow,
} from "@/lib/appointments/map-summary";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import type { AppointmentSummary } from "@/types/appointment";

export type AdminClientAccountProfile = {
  birthDate: string | null;
  allergenStatus: string | null;
  regularMedications: string | null;
  chronicConditionPregnancy: string | null;
  skinHairType: string | null;
  kvkkConsentAt: string | null;
  commercialConsentAt: string | null;
  serviceRiskConsentAt: string | null;
};

export type AdminClientDetail = {
  client: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    note: string | null;
    userId: string | null;
    businessApprovedAt: string | null;
    phoneVerifiedAt: string | null;
    inviteToken: string | null;
    inviteExpiresAt: string | null;
    createdAt: string;
  };
  accountProfile: AdminClientAccountProfile | null;
  appointments: AppointmentSummary[];
};

function mapAccountProfile(row: Record<string, unknown> | null): AdminClientAccountProfile | null {
  if (!row) return null;
  return {
    birthDate: typeof row.birth_date === "string" ? row.birth_date : null,
    allergenStatus: typeof row.allergen_status === "string" ? row.allergen_status : null,
    regularMedications: typeof row.regular_medications === "string" ? row.regular_medications : null,
    chronicConditionPregnancy:
      typeof row.chronic_condition_pregnancy === "string" ? row.chronic_condition_pregnancy : null,
    skinHairType: typeof row.skin_hair_type === "string" ? row.skin_hair_type : null,
    kvkkConsentAt: typeof row.kvkk_consent_at === "string" ? row.kvkk_consent_at : null,
    commercialConsentAt: typeof row.commercial_consent_at === "string" ? row.commercial_consent_at : null,
    serviceRiskConsentAt: typeof row.service_risk_consent_at === "string" ? row.service_risk_consent_at : null,
  };
}

export async function getAdminClientDetail(
  tenantId: string,
  clientId: string
): Promise<{ detail: AdminClientDetail | null; error: string | null }> {
  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return { detail: null, error: "Sunucu yapılandırması eksik." };
  }

  const { data: row, error: cErr } = await admin
    .from("clients")
    .select(
      "id,name,phone,email,note,user_id,business_approved_at,phone_verified_at,invite_token,invite_expires_at,created_at,tenant_id"
    )
    .eq("id", clientId)
    .maybeSingle();

  if (cErr) {
    return { detail: null, error: cErr.message };
  }
  if (!row || (row.tenant_id as string) !== tenantId) {
    return { detail: null, error: "Müşteri bulunamadı." };
  }

  const userId = (row.user_id as string | null) ?? null;

  let accountProfile: AdminClientAccountProfile | null = null;
  if (userId) {
    const { data: profile } = await admin
      .from("customer_profiles")
      .select(
        "birth_date,allergen_status,regular_medications,chronic_condition_pregnancy,skin_hair_type,kvkk_consent_at,commercial_consent_at,service_risk_consent_at"
      )
      .eq("user_id", userId)
      .maybeSingle();
    accountProfile = mapAccountProfile(profile as Record<string, unknown> | null);
  }

  const { data: appts, error: aErr } = await admin
    .from("appointments")
    .select(APPOINTMENT_SUMMARY_SELECT)
    .eq("client_id", clientId)
    .eq("tenant_id", tenantId)
    .order("start_time", { ascending: false });

  if (aErr) {
    return { detail: null, error: aErr.message };
  }

  const appointments = (appts ?? []).map((item) =>
    mapAppointmentSummaryRow(item as Record<string, unknown>)
  );

  return {
    detail: {
      client: {
        id: row.id as string,
        name: row.name as string,
        phone: (row.phone as string | null) ?? null,
        email: (row.email as string | null) ?? null,
        note: (row.note as string | null) ?? null,
        userId,
        businessApprovedAt: (row.business_approved_at as string | null) ?? null,
        phoneVerifiedAt: (row.phone_verified_at as string | null) ?? null,
        inviteToken: (row.invite_token as string | null) ?? null,
        inviteExpiresAt: (row.invite_expires_at as string | null) ?? null,
        createdAt: row.created_at as string,
      },
      accountProfile,
      appointments,
    },
    error: null,
  };
}
