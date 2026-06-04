"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  canAddBranch,
  hasBooleanFeature,
  isWithinNumericLimit,
  type ResolvedTenantFeatures,
} from "@/lib/features";
import type { BooleanFeatureKey, NumericFeatureKey } from "@/types/features";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const BOOLEAN_FEATURE_LABELS: Record<BooleanFeatureKey, string> = {
  autoEmailReminders: "Otomatik e-posta hatırlatmaları",
  loyaltyProgram: "Sadakat programı",
  advancedReporting: "Gelişmiş raporlama",
  googleCalendarSync: "Google Takvim senkronizasyonu",
  whatsappIntegration: "WhatsApp entegrasyonu",
  aiAnalytics: "Yapay zeka analitiği",
};

const NUMERIC_FEATURE_LABELS: Record<NumericFeatureKey, string> = {
  maxUsers: "Kullanıcı limiti",
  maxBranches: "Şube limiti",
  smsLimit: "SMS kotası",
};

type FallbackMode = "hide" | "upsell" | ReactNode;

type BaseProps = {
  features: ResolvedTenantFeatures;
  children: ReactNode;
  /** Yetki yoksa: gizle (varsayılan), upsell kartı veya özel içerik */
  fallback?: FallbackMode;
  upsellTitle?: string;
  upsellMessage?: string;
  /** Upsell kartındaki CTA bağlantısı */
  upgradeHref?: string;
};

type BooleanGuardProps = BaseProps & {
  booleanFeature: BooleanFeatureKey;
  limitFeature?: never;
  currentCount?: never;
};

type LimitGuardProps = BaseProps & {
  limitFeature: NumericFeatureKey;
  /** Limit kontrolü: mevcut kayıt sayısı (yeni eklemeden önce) */
  currentCount: number;
  booleanFeature?: never;
};

export type FeatureGuardProps = BooleanGuardProps | LimitGuardProps;

function resolveAccess(props: FeatureGuardProps): boolean {
  if ("booleanFeature" in props && props.booleanFeature) {
    return hasBooleanFeature(props.features, props.booleanFeature);
  }

  if ("limitFeature" in props && props.limitFeature != null) {
    const max = props.features[props.limitFeature];
    if (props.limitFeature === "maxBranches") {
      return canAddBranch(props.features, props.currentCount);
    }
    return isWithinNumericLimit(props.currentCount, max);
  }

  return false;
}

function defaultUpsellCopy(props: FeatureGuardProps): { title: string; message: string } {
  const titleOverride = props.upsellTitle;
  const messageOverride = props.upsellMessage;

  if ("booleanFeature" in props && props.booleanFeature) {
    const label = BOOLEAN_FEATURE_LABELS[props.booleanFeature];
    return {
      title: titleOverride ?? `${label} paketinizde kapalı`,
      message:
        messageOverride ??
        "Bu modülü kullanmak için Pro veya Ultimate paketine geçin ya da platform yöneticinizden özel açılım isteyin.",
    };
  }

  if ("limitFeature" in props && props.limitFeature) {
    const label = NUMERIC_FEATURE_LABELS[props.limitFeature];
    const max = props.features[props.limitFeature];
    return {
      title: titleOverride ?? `${label} doldu`,
      message:
        messageOverride ??
        (max === -1
          ? "Limit tanımlı değil."
          : `Mevcut paketiniz en fazla ${max} kayda izin veriyor. Yükseltme için yöneticinizle görüşün.`),
    };
  }

  return {
    title: titleOverride ?? "Özellik kullanılamıyor",
    message: messageOverride ?? "Bu özellik mevcut abonelik paketinizde yer almıyor.",
  };
}

function UpsellBanner({
  title,
  message,
  upgradeHref,
}: {
  title: string;
  message: string;
  upgradeHref: string;
}) {
  return (
    <Card className="border-dashed border-primary/40 bg-muted/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          href={upgradeHref}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Paket ve ayarlar
        </Link>
      </CardContent>
    </Card>
  );
}

/**
 * Paket + override özellik haritasına göre içeriği gösterir veya gizler / upsell sunar.
 */
export function FeatureGuard(props: FeatureGuardProps) {
  const allowed = resolveAccess(props);

  if (allowed) {
    return <>{props.children}</>;
  }

  const fallback = props.fallback ?? "hide";
  if (fallback === "hide") {
    return null;
  }

  if (fallback !== "hide" && fallback !== "upsell") {
    return <>{fallback}</>;
  }

  const copy = defaultUpsellCopy(props);
  return (
    <UpsellBanner
      title={copy.title}
      message={copy.message}
      upgradeHref={props.upgradeHref ?? "/admin/settings"}
    />
  );
}
