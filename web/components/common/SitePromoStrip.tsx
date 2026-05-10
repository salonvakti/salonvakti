import Link from "next/link";
import { MapPin } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SALON_GOOGLE_MAPS_PROMO } from "@/lib/marketing/salon-promo";
import { cn } from "@/lib/utils";

export function SitePromoStrip({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "border-b-2 border-amber-500/60 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-amber-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
        className
      )}
      role="region"
      aria-label="Kampanya duyurusu"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-stretch gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-3 sm:py-2 md:px-4">
        <div className="flex min-w-0 flex-1 items-start justify-center gap-2 sm:justify-start">
          <MapPin
            className="mt-0.5 hidden h-5 w-5 shrink-0 text-amber-900 sm:block"
            aria-hidden
          />
          <p className="text-center text-[0.8125rem] font-bold leading-snug tracking-tight sm:text-left sm:text-sm md:text-base">
            {SALON_GOOGLE_MAPS_PROMO}
          </p>
        </div>
        <Link
          href="/register"
          className={cn(
            buttonVariants({ size: "sm" }),
            "shrink-0 border-amber-900/20 bg-amber-950 text-amber-50 hover:bg-amber-900 sm:self-center"
          )}
        >
          Başvur
        </Link>
      </div>
    </div>
  );
}
