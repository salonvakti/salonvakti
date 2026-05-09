type Props = {
  address: string;
  /** iframe title / erişilebilirlik */
  ariaLabel: string;
};

/** Google embed için arama sorgusu (Plus Code ve Türkçe adresler için iyileştirilmiş). */
function buildEmbedSearchQuery(raw: string): string {
  let q = raw.trim();
  if (!q) return "";

  const lower = q.toLowerCase();
  const hasPlusCode = /[A-Z0-9]{4}\+[A-Z0-9]{2,}/i.test(q);

  if (hasPlusCode && !lower.includes("türkiye") && !lower.includes("turkey")) {
    q = `${q}, Türkiye`;
  }

  return q;
}

/**
 * Google Haritalar gömülü görünümü (API anahtarı gerektirmez).
 * `maps.google.com` yerine `www.google.com/maps` kullanılır (Plus Code / embed uyumu).
 */
export function GoogleMapEmbed({ address, ariaLabel }: Props) {
  const q = buildEmbedSearchQuery(address);
  if (!q) return null;

  const src = `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed&hl=tr&z=16`;

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg border bg-muted/30">
      <iframe
        title={ariaLabel}
        src={src}
        className="h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
