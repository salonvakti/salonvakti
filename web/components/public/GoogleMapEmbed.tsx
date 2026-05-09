type Props = {
  address: string;
  /** iframe title / erişilebilirlik */
  ariaLabel: string;
};

/** Google Haritalar gömülü görünümü (API anahtarı gerektirmez; adres metnine göre). */
export function GoogleMapEmbed({ address, ariaLabel }: Props) {
  const q = address.trim();
  if (!q) return null;

  const src = `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed&hl=tr&z=16`;

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
