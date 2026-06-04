import Image from "next/image";
import { cn } from "@/lib/utils";
import { DEFAULT_LANDING_HERO_BANNER } from "@/lib/landing/default-assets";

type Props = {
  imageUrl: string | null;
  alt: string;
  className?: string;
};

/**
 * Teeno demosundaki gibi: çerçevesiz, sağda yüzen büyük banner / mockup görseli.
 * @see https://shtheme.com/demosd/teeno/
 */
export function HeroBannerVisual({ imageUrl, alt, className }: Props) {
  const src = imageUrl?.trim() || DEFAULT_LANDING_HERO_BANNER;
  const isLocal = src.startsWith("/");

  return (
    <div className={cn("relative mx-auto w-full max-w-lg md:max-w-xl lg:max-w-none", className)}>
      {/* Dekoratif şekiller (Teeno banner arka planı) */}
      <div
        className="absolute -left-8 top-1/4 h-32 w-32 rounded-full bg-primary/25 blur-2xl"
        aria-hidden
      />
      <div
        className="absolute -right-6 bottom-1/4 h-40 w-40 rounded-full bg-violet-500/20 blur-2xl"
        aria-hidden
      />
      <div
        className="absolute left-1/2 top-8 h-24 w-24 -translate-x-1/2 rounded-2xl bg-sky-400/15 blur-xl rotate-12"
        aria-hidden
      />
      <div
        className="absolute right-4 top-0 h-16 w-16 rounded-full border-4 border-primary/20"
        aria-hidden
      />
      <div
        className="absolute bottom-12 left-0 h-10 w-10 rounded-lg bg-amber-400/30 blur-sm"
        aria-hidden
      />

      <div className="relative z-10 flex justify-center md:justify-end">
        {isLocal ? (
          <Image
            src={src}
            alt={alt}
            width={640}
            height={720}
            priority
            className="h-auto w-full max-w-[min(100%,520px)] object-contain drop-shadow-[0_28px_48px_rgba(0,0,0,0.18)] md:max-w-[560px] lg:-mr-8 lg:max-w-[600px]"
            sizes="(max-width: 768px) 90vw, 560px"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            className="h-auto w-full max-w-[min(100%,520px)] object-contain drop-shadow-[0_28px_48px_rgba(0,0,0,0.18)] md:max-w-[560px] lg:-mr-8 lg:max-w-[600px]"
          />
        )}
      </div>
    </div>
  );
}
