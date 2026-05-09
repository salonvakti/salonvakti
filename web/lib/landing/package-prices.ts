import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LandingPackagePriceRow } from "@/lib/db-types";

export type LandingPackageSlug = LandingPackagePriceRow["slug"];

const FALLBACK: Record<LandingPackageSlug, string> = {
  basic: "—",
  pro: "—",
  ultimate: "—",
};

/** Anon / oturum ile okunabilir (RLS: herkese SELECT). */
export async function getLandingPackagePriceLabels(): Promise<Record<LandingPackageSlug, string>> {
  const supabase = await createSupabaseServerClient();
  const out = { ...FALLBACK };
  if (!supabase) return out;

  const { data, error } = await supabase
    .from("landing_package_prices")
    .select("slug,price_label");

  if (error || !data) return out;

  for (const row of data as Pick<LandingPackagePriceRow, "slug" | "price_label">[]) {
    if (row.slug === "basic" || row.slug === "pro" || row.slug === "ultimate") {
      out[row.slug] = row.price_label?.trim() || "—";
    }
  }
  return out;
}
