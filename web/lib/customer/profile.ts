import "server-only";

import type { User } from "@supabase/supabase-js";
import { buildDisplayName, parseNameParts } from "@/lib/customer/profile-names";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";

export type CustomerProfileData = {
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  birthDate: string | null;
  allergenStatus: string | null;
  regularMedications: string | null;
  chronicConditionPregnancy: string | null;
  skinHairType: string | null;
  kvkkConsent: boolean;
  commercialConsent: boolean;
  serviceRiskConsent: boolean;
  linkedSalons: { tenantId: string; tenantName: string }[];
};

export type CustomerProfileInput = {
  firstName: string;
  lastName: string;
  phone: string | null;
  birthDate: string | null;
  allergenStatus: string | null;
  regularMedications: string | null;
  chronicConditionPregnancy: string | null;
  skinHairType: string | null;
  kvkkConsent: boolean;
  commercialConsent: boolean;
  serviceRiskConsent: boolean;
};

export async function getCustomerProfileForUser(user: User): Promise<CustomerProfileData> {
  const meta = user.user_metadata ?? {};
  const { firstName, lastName } = parseNameParts(meta);
  const phone = typeof meta.phone === "string" && meta.phone.trim() ? meta.phone.trim() : null;

  const admin = createServiceRoleSupabaseClient();
  const emptyHealth = {
    birthDate: null as string | null,
    allergenStatus: null as string | null,
    regularMedications: null as string | null,
    chronicConditionPregnancy: null as string | null,
    skinHairType: null as string | null,
    kvkkConsent: false,
    commercialConsent: false,
    serviceRiskConsent: false,
  };

  if (!admin) {
    return {
      firstName,
      lastName,
      phone,
      email: user.email ?? null,
      ...emptyHealth,
      linkedSalons: [],
    };
  }

  const [{ data: profile }, { data: clients }] = await Promise.all([
    admin.from("customer_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    admin.from("clients").select("tenant_id").eq("user_id", user.id),
  ]);

  const tenantIds = Array.from(new Set((clients ?? []).map((c) => c.tenant_id as string)));
  let linkedSalons: { tenantId: string; tenantName: string }[] = [];

  if (tenantIds.length) {
    const { data: tenants } = await admin.from("tenants").select("id,name").in("id", tenantIds);
    linkedSalons = (tenants ?? []).map((t) => ({
      tenantId: t.id as string,
      tenantName: (t.name as string) ?? "İşletme",
    }));
  }

  const p = profile as Record<string, unknown> | null;

  return {
    firstName,
    lastName,
    phone,
    email: user.email ?? null,
    birthDate: typeof p?.birth_date === "string" ? p.birth_date : null,
    allergenStatus: typeof p?.allergen_status === "string" ? p.allergen_status : null,
    regularMedications: typeof p?.regular_medications === "string" ? p.regular_medications : null,
    chronicConditionPregnancy:
      typeof p?.chronic_condition_pregnancy === "string" ? p.chronic_condition_pregnancy : null,
    skinHairType: typeof p?.skin_hair_type === "string" ? p.skin_hair_type : null,
    kvkkConsent: Boolean(p?.kvkk_consent_at),
    commercialConsent: Boolean(p?.commercial_consent_at),
    serviceRiskConsent: Boolean(p?.service_risk_consent_at),
    linkedSalons,
  };
}

export async function saveCustomerProfileForUser(
  user: User,
  input: CustomerProfileInput
): Promise<{ ok: boolean; error: string | null }> {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  if (!firstName) {
    return { ok: false, error: "Ad gerekli." };
  }
  if (!input.kvkkConsent) {
    return { ok: false, error: "KVKK aydınlatma metni onayı zorunludur." };
  }

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return { ok: false, error: "Sunucu yapılandırması eksik." };
  }

  const displayName = buildDisplayName(firstName, lastName);
  const phone = input.phone?.trim() || null;
  const now = new Date().toISOString();
  const meta = { ...(user.user_metadata ?? {}) };

  const { error: authErr } = await admin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...meta,
      first_name: firstName,
      last_name: lastName || null,
      phone,
      display_name: displayName || firstName,
    },
  });

  if (authErr) {
    return { ok: false, error: authErr.message };
  }

  const profilePayload = {
    user_id: user.id,
    birth_date: input.birthDate?.trim() || null,
    allergen_status: input.allergenStatus?.trim() || null,
    regular_medications: input.regularMedications?.trim() || null,
    chronic_condition_pregnancy: input.chronicConditionPregnancy?.trim() || null,
    skin_hair_type: input.skinHairType?.trim() || null,
    kvkk_consent_at: input.kvkkConsent ? now : null,
    commercial_consent_at: input.commercialConsent ? now : null,
    service_risk_consent_at: input.serviceRiskConsent ? now : null,
    updated_at: now,
  };

  const { error: profileErr } = await admin
    .from("customer_profiles")
    .upsert(profilePayload, { onConflict: "user_id" });

  if (profileErr) {
    return { ok: false, error: profileErr.message };
  }

  const fullName = displayName || firstName;
  const { error: clientsErr } = await admin
    .from("clients")
    .update({ name: fullName, phone, email: user.email ?? null })
    .eq("user_id", user.id);

  if (clientsErr) {
    return { ok: false, error: clientsErr.message };
  }

  return { ok: true, error: null };
}
