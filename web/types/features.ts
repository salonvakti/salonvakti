/**
 * Abonelik paketleri ve işletme özellik (feature) limitleri.
 * -1 sayısal limitlerde sınırsız (infinity) anlamına gelir.
 */

export const PLAN_TYPES = ["basic", "pro", "ultimate"] as const;

export type PlanType = (typeof PLAN_TYPES)[number];

/** Paket + override birleşiminden çıkan nihai özellik haritası */
export interface TenantFeatures {
  maxUsers: number;
  maxBranches: number;
  smsLimit: number;
  autoEmailReminders: boolean;
  loyaltyProgram: boolean;
  advancedReporting: boolean;
  googleCalendarSync: boolean;
  whatsappIntegration: boolean;
  aiAnalytics: boolean;
}

export type ResolvedTenantFeatures = TenantFeatures;

/** Paket dışı tekil modül / limit ezmesi (jsonb feature_overrides) */
export type FeatureOverrides = Partial<TenantFeatures>;

/** Sayısal özellik anahtarları */
export type NumericFeatureKey = {
  [K in keyof TenantFeatures]: TenantFeatures[K] extends number ? K : never;
}[keyof TenantFeatures];

/** Boolean özellik anahtarları */
export type BooleanFeatureKey = {
  [K in keyof TenantFeatures]: TenantFeatures[K] extends boolean ? K : never;
}[keyof TenantFeatures];

/** -1 = sınırsız */
export const FEATURE_UNLIMITED = -1 as const;

export const PLAN_LABELS: Record<PlanType, string> = {
  basic: "Basic",
  pro: "Pro",
  ultimate: "Ultimate",
};

export const PLAN_FEATURES_DEFAULT: Record<PlanType, TenantFeatures> = {
  basic: {
    maxUsers: 2,
    maxBranches: 1,
    smsLimit: 0,
    autoEmailReminders: false,
    loyaltyProgram: false,
    advancedReporting: false,
    googleCalendarSync: false,
    whatsappIntegration: false,
    aiAnalytics: false,
  },
  pro: {
    maxUsers: 5,
    maxBranches: 2,
    smsLimit: 500,
    autoEmailReminders: true,
    loyaltyProgram: true,
    advancedReporting: true,
    googleCalendarSync: true,
    whatsappIntegration: false,
    aiAnalytics: false,
  },
  ultimate: {
    maxUsers: FEATURE_UNLIMITED,
    maxBranches: FEATURE_UNLIMITED,
    smsLimit: FEATURE_UNLIMITED,
    autoEmailReminders: true,
    loyaltyProgram: true,
    advancedReporting: true,
    googleCalendarSync: true,
    whatsappIntegration: true,
    aiAnalytics: true,
  },
};
