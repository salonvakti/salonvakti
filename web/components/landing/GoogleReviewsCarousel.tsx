"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import type { GoogleMapsReview } from "@/types/public-site";
import { cn } from "@/lib/utils";

type Props = {
  reviews: GoogleMapsReview[];
  mapsUrl: string | null;
  rating: number | null;
  reviewCount: number | null;
};

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} / 5 yıldız`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i <= rating ? "fill-primary text-primary" : "fill-muted text-muted"
          )}
          aria-hidden
        />
      ))}
    </div>
  );
}

export function GoogleReviewsCarousel({ reviews, mapsUrl, rating, reviewCount }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(reviews.length > 3);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanPrev(scrollLeft > 8);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 8);
  }, []);

  const scroll = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-review-card]");
    const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.85;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => updateArrows());
    ro.observe(el);
    return () => ro.disconnect();
  }, [reviews.length, updateArrows]);

  if (reviews.length === 0) return null;

  return (
    <div className="relative">
      {reviews.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => scroll(-1)}
            disabled={!canPrev}
            className="absolute -left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background shadow-md transition-opacity disabled:opacity-30 md:flex lg:-left-4"
            aria-label="Önceki yorumlar"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            disabled={!canNext}
            className="absolute -right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background shadow-md transition-opacity disabled:opacity-30 md:flex lg:-right-4"
            aria-label="Sonraki yorumlar"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </>
      ) : null}

      <div
        ref={trackRef}
        onScroll={updateArrows}
        className="flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {reviews.map((t, i) => (
          <blockquote
            key={`${t.authorName}-${i}`}
            data-review-card
            className="relative flex min-h-[220px] w-[min(100%,320px)] shrink-0 snap-start flex-col rounded-2xl border bg-card p-6 shadow-sm sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
          >
            <Quote className="mb-3 h-8 w-8 text-primary/30" aria-hidden />
            <StarRow rating={t.rating} />
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              &ldquo;{t.text}&rdquo;
            </p>
            <footer className="mt-5 rounded-xl bg-primary/5 px-4 py-3">
              <div className="flex items-center gap-3">
                {t.profilePhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.profilePhotoUrl}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                    {t.authorName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground">{t.authorName}</p>
                  {t.relativeTime ? (
                    <p className="text-xs text-muted-foreground">{t.relativeTime}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Google Haritalar</p>
                  )}
                </div>
              </div>
            </footer>
          </blockquote>
        ))}
      </div>

      {mapsUrl ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          {rating != null && reviewCount != null ? (
            <span className="font-medium text-foreground">
              Google&apos;da {rating.toFixed(1)} · {reviewCount} değerlendirme
            </span>
          ) : null}
          {rating != null && reviewCount != null ? " · " : null}
          <Link href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Tüm yorumları Google Haritalar&apos;da gör
          </Link>
        </p>
      ) : null}
    </div>
  );
}
