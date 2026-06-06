import { headers } from "next/headers";

function normalizeOrigin(raw: string): string {
  return raw.trim().replace(/\/$/, "");
}

/** Ortam değişkenlerinden site kökü (build / metadata). */
function resolveSiteOriginFromEnv(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.URL,
    process.env.DEPLOY_PRIME_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ];

  for (const raw of candidates) {
    if (raw?.trim()) return normalizeOrigin(raw);
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  return "";
}

/** Tam URL (canonical, JSON-LD); üretimde NEXT_PUBLIC_SITE_URL tanımlı olmalıdır. */
export function getSiteOrigin(): string {
  return resolveSiteOriginFromEnv();
}

/** Aktif istekten site kökü — davet / paylaşım bağlantıları için tercih edilir. */
export async function getRequestSiteOrigin(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) {
      const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
      return `${proto}://${host.split(",")[0].trim()}`;
    }
  } catch {
    // headers() yalnızca istek bağlamında kullanılabilir
  }

  return resolveSiteOriginFromEnv();
}

export function absoluteUrl(path: string): string {
  const origin = getSiteOrigin();
  const p = path.startsWith("/") ? path : `/${path}`;
  return origin ? `${origin}${p}` : p;
}

/** Sunucu isteğine göre tam URL (davet, SMS, panoya kopyalama). */
export async function absoluteUrlFromRequest(path: string): Promise<string> {
  const origin = await getRequestSiteOrigin();
  const p = path.startsWith("/") ? path : `/${path}`;
  return origin ? `${origin}${p}` : p;
}
