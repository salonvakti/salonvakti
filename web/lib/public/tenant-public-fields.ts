/**
 * Tanıtım sayfası alanları: tenants.promo_text / address ile birlikte
 * settings_json içindeki yedek anahtarlar (landing_*), migration veya senkron sorunlarında kullanılır.
 */

export function pickPublicPromo(row: Record<string, unknown>): string | null {
  const pt = row.promo_text;
  if (typeof pt === "string" && pt.trim()) return pt.trim();
  const sj = row.settings_json;
  if (sj && typeof sj === "object" && !Array.isArray(sj)) {
    const o = sj as Record<string, unknown>;
    if (typeof o.landing_promo === "string" && o.landing_promo.trim()) return o.landing_promo.trim();
    if (typeof o.promo_text === "string" && o.promo_text.trim()) return o.promo_text.trim();
  }
  return null;
}

export function pickPublicAddress(row: Record<string, unknown>): string | null {
  const ad = row.address;
  if (typeof ad === "string" && ad.trim()) return ad.trim();
  const sj = row.settings_json;
  if (sj && typeof sj === "object" && !Array.isArray(sj)) {
    const o = sj as Record<string, unknown>;
    if (typeof o.landing_address === "string" && o.landing_address.trim()) return o.landing_address.trim();
    if (typeof o.map_query === "string" && o.map_query.trim()) return o.map_query.trim();
  }
  return null;
}

export function mergeLandingIntoSettingsJson(
  existing: unknown,
  landing: { promo: string | null; address: string | null }
): Record<string, unknown> {
  const base =
    existing && typeof existing === "object" && !Array.isArray(existing)
      ? { ...(existing as Record<string, unknown>) }
      : {};
  base.landing_promo = landing.promo?.trim() ? landing.promo.trim() : null;
  base.landing_address = landing.address?.trim() ? landing.address.trim() : null;
  return base;
}
