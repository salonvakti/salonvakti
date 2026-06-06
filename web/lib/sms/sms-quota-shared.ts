import { FEATURE_UNLIMITED, isUnlimitedLimit } from "@/lib/features";
import type { ResolvedTenantFeatures } from "@/types/features";

export function hasSmsPackage(features: ResolvedTenantFeatures): boolean {
  return features.smsLimit !== 0;
}

export function getSmsQuotaLabel(features: ResolvedTenantFeatures): string {
  if (!hasSmsPackage(features)) return "SMS yok";
  if (isUnlimitedLimit(features.smsLimit)) return "Sınırsız";
  return `${features.smsLimit} / ay`;
}

export function canSendSmsByQuota(
  features: ResolvedTenantFeatures,
  sentThisMonth: number
): { ok: true } | { ok: false; error: string } {
  if (!hasSmsPackage(features)) {
    return { ok: false, error: "SMS gönderimi yalnızca Pro ve Ultimate paketlerde kullanılabilir." };
  }
  if (isUnlimitedLimit(features.smsLimit)) {
    return { ok: true };
  }
  if (sentThisMonth >= features.smsLimit) {
    return {
      ok: false,
      error: `Aylık SMS kotanız doldu (${features.smsLimit}). Ultimate pakete geçerek sınırsız SMS kullanabilirsiniz.`,
    };
  }
  return { ok: true };
}

export function remainingSmsQuota(features: ResolvedTenantFeatures, sentThisMonth: number): number | null {
  if (!hasSmsPackage(features)) return 0;
  if (isUnlimitedLimit(features.smsLimit)) return FEATURE_UNLIMITED;
  return Math.max(0, features.smsLimit - sentThisMonth);
}
