import type { SupabaseClient } from "@supabase/supabase-js";
import {
  FEATURE_UNLIMITED,
  PLAN_FEATURES_DEFAULT,
  PLAN_TYPES,
  type BooleanFeatureKey,
  type FeatureOverrides,
  type NumericFeatureKey,
  type PlanType,
  type ResolvedTenantFeatures,
  type TenantFeatures,
} from "@/types/features";

export {
  FEATURE_UNLIMITED,
  PLAN_FEATURES_DEFAULT,
  PLAN_LABELS,
  PLAN_TYPES,
} from "@/types/features";
export type {
  BooleanFeatureKey,
  FeatureOverrides,
  NumericFeatureKey,
  PlanType,
  ResolvedTenantFeatures,
  TenantFeatures,
} from "@/types/features";

const NUMERIC_KEYS: NumericFeatureKey[] = [
  "maxUsers",
  "maxBranches",
  "smsLimit",
];

const BOOLEAN_KEYS: BooleanFeatureKey[] = [
  "autoEmailReminders",
  "loyaltyProgram",
  "advancedReporting",
  "googleCalendarSync",
  "whatsappIntegration",
  "aiAnalytics",
];

/** Ham plan_type / license_plan metnini güvenli PlanType'a çevirir */
export function normalizePlanType(raw: string | null | undefined): PlanType {
  const v = (raw ?? "").trim().toLowerCase();
  if (v === "pro" || v === "ultimate") return v;
  return "basic";
}

/** JSONB veya Record'tan sadece geçerli override alanlarını ayıklar */
export function parseFeatureOverrides(
  raw: unknown
): FeatureOverrides {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  const src = raw as Record<string, unknown>;
  const out: FeatureOverrides = {};

  for (const key of NUMERIC_KEYS) {
    const v = src[key];
    if (typeof v === "number" && Number.isFinite(v)) {
      out[key] = Math.trunc(v);
    }
  }

  for (const key of BOOLEAN_KEYS) {
    const v = src[key];
    if (typeof v === "boolean") {
      out[key] = v;
    }
  }

  return out;
}

/**
 * Paket varsayılanları ile feature_overrides birleşimi.
 * Override, aynı anahtar için paket değerinin üzerine yazar.
 */
export function getTenantFeatures(
  planType: string | null | undefined,
  featureOverrides?: FeatureOverrides | Record<string, unknown> | null
): ResolvedTenantFeatures {
  const plan = normalizePlanType(planType);
  const base = PLAN_FEATURES_DEFAULT[plan];
  const overrides = parseFeatureOverrides(featureOverrides ?? {});
  return { ...base, ...overrides };
}

export function isUnlimitedLimit(limit: number): boolean {
  return limit === FEATURE_UNLIMITED;
}

/** Mevcut kullanım limit dahilinde mi? (henüz eklemeden önceki sayım için: currentCount < max) */
export function isWithinNumericLimit(currentCount: number, max: number): boolean {
  if (!Number.isFinite(currentCount) || currentCount < 0) return false;
  if (isUnlimitedLimit(max)) return true;
  return currentCount < max;
}

export function canAddBranch(
  features: ResolvedTenantFeatures,
  currentBranchCount: number
): boolean {
  return isWithinNumericLimit(currentBranchCount, features.maxBranches);
}

export function hasBooleanFeature(
  features: ResolvedTenantFeatures,
  key: BooleanFeatureKey
): boolean {
  return features[key] === true;
}

export function getBranchLimitErrorMessage(features: ResolvedTenantFeatures): string {
  if (isUnlimitedLimit(features.maxBranches)) {
    return "Şube limiti aşıldı.";
  }
  return `Paketiniz en fazla ${features.maxBranches} şubeye izin veriyor. Daha fazlası için paketinizi yükseltin veya platform yöneticinizle iletişime geçin.`;
}

/** Şube oluşturmadan önce sunucu tarafı limit kontrolü */
export function assertCanCreateBranch(
  features: ResolvedTenantFeatures,
  currentBranchCount: number
): { ok: true } | { ok: false; error: string } {
  if (canAddBranch(features, currentBranchCount)) {
    return { ok: true };
  }
  return { ok: false, error: getBranchLimitErrorMessage(features) };
}

export type TenantFeatureRow = {
  plan_type: string | null;
  feature_overrides: unknown;
  license_plan?: string | null;
};

/** Supabase'ten kiracı plan + override okuyup özellik haritası üretir */
export async function loadTenantFeaturesById(
  supabase: SupabaseClient,
  tenantId: string
): Promise<{ features: ResolvedTenantFeatures; error: string | null }> {
  const { data, error } = await supabase
    .from("tenants")
    .select("plan_type, feature_overrides, license_plan")
    .eq("id", tenantId)
    .maybeSingle();

  if (error) {
    return { features: getTenantFeatures("basic"), error: error.message };
  }
  if (!data) {
    return { features: getTenantFeatures("basic"), error: "İşletme kaydı bulunamadı." };
  }

  const row = data as TenantFeatureRow;
  const plan = row.plan_type ?? row.license_plan;
  const features = getTenantFeatures(plan, parseFeatureOverrides(row.feature_overrides));

  return { features, error: null };
}
