/**
 * Süre bazlı lisans: hem başlangıç hem bitiş null ise kısıt uygulanmaz (geriye dönük uyum).
 */
export function isTenantLicenseActive(tenant: {
  license_start_at: string | null;
  license_end_at: string | null;
}): boolean {
  const now = Date.now();
  if (tenant.license_end_at != null && tenant.license_end_at !== "") {
    const end = new Date(tenant.license_end_at).getTime();
    if (!Number.isFinite(end) || now > end) return false;
  }
  if (tenant.license_start_at != null && tenant.license_start_at !== "") {
    const start = new Date(tenant.license_start_at).getTime();
    if (!Number.isFinite(start) || now < start) return false;
  }
  return true;
}

export function formatLicenseWindow(
  start: string | null,
  end: string | null
): { label: string; active: boolean } {
  const active = isTenantLicenseActive({ license_start_at: start, license_end_at: end });
  if (!start && !end) {
    return { label: "Süre tanımlı değil (sınırsız)", active: true };
  }
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" });
  if (start && end) return { label: `${fmt(start)} — ${fmt(end)}`, active };
  if (end) return { label: `Bitiş: ${fmt(end)}`, active };
  return { label: `Başlangıç: ${fmt(start!)}`, active };
}
