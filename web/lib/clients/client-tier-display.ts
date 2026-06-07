export type ClientTierRow = {
  business_approved_at: string | null;
  phone_verified_at: string | null;
};

export type DisplayTier = "business_approved" | "phone_verified" | "platform_only";

export function getClientDisplayTier(c: ClientTierRow): DisplayTier {
  if (c.business_approved_at) return "business_approved";
  if (c.phone_verified_at) return "phone_verified";
  return "platform_only";
}

export const clientTierMeta: Record<
  DisplayTier,
  { label: string; badgeClass: string; rowClass: string; dotClass: string }
> = {
  business_approved: {
    label: "İşletme onaylı",
    badgeClass: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    rowClass: "border-l-2 border-l-green-500",
    dotClass: "bg-green-500",
  },
  phone_verified: {
    label: "Telefon onaylı",
    badgeClass: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    rowClass: "border-l-2 border-l-yellow-500",
    dotClass: "bg-yellow-500",
  },
  platform_only: {
    label: "Platform kaydı",
    badgeClass: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
    rowClass: "border-l-2 border-l-orange-500",
    dotClass: "bg-orange-500",
  },
};
