import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FloatingShapes({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <div className="absolute -left-16 top-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute right-0 top-32 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-600/15" />
      <div className="absolute bottom-10 left-1/3 h-40 w-40 rounded-full bg-sky-400/15 blur-2xl" />
    </div>
  );
}

export function SectionBadge({ children }: { children: ReactNode }) {
  return (
    <span className="teeno-landing-badge inline-block rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
      {children}
    </span>
  );
}

export function SectionHeading({
  badge,
  title,
  subtitle,
  center = true,
}: {
  badge: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl space-y-3", center && "mx-auto text-center")}>
      <SectionBadge>{badge}</SectionBadge>
      <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      {subtitle ? (
        <p className="text-base text-muted-foreground md:text-lg">{subtitle}</p>
      ) : null}
    </div>
  );
}

/** Teeno tarzı telefon / panel mockup çerçevesi */
export function DeviceMockup({
  imageUrl,
  alt,
  className,
}: {
  imageUrl: string | null;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[320px] rounded-[2rem] border-[10px] border-foreground/10 bg-gradient-to-b from-muted/80 to-muted p-2 shadow-2xl shadow-primary/10 md:max-w-[360px]",
        className
      )}
    >
      <div className="absolute left-1/2 top-3 h-1.5 w-16 -translate-x-1/2 rounded-full bg-foreground/15" />
      <div className="mt-4 overflow-hidden rounded-[1.4rem] bg-background aspect-[9/16] min-h-[280px] md:min-h-[380px]">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={alt} className="h-full w-full object-cover object-top" />
        ) : (
          <div className="flex h-full flex-col gap-3 p-4">
            <div className="h-3 w-2/3 rounded-full bg-primary/30" />
            <div className="h-20 rounded-xl bg-primary/15" />
            <div className="space-y-2">
              <div className="h-2 w-full rounded bg-muted" />
              <div className="h-2 w-5/6 rounded bg-muted" />
              <div className="h-2 w-4/6 rounded bg-muted" />
            </div>
            <div className="mt-auto grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square rounded-lg bg-primary/20" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function WideShowcaseImage({
  imageUrl,
  alt,
}: {
  imageUrl: string | null;
  alt: string;
}) {
  if (!imageUrl) {
    return (
      <div className="mx-auto flex aspect-[16/9] max-w-4xl items-center justify-center rounded-2xl border bg-gradient-to-br from-primary/10 via-muted to-primary/5 p-8 shadow-inner">
        <p className="text-center text-sm text-muted-foreground">
          Platform → Site görünümü veya Medya kütüphanesinden kahraman / OG görseli ekleyin.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border shadow-xl shadow-primary/5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt={alt} className="h-auto w-full object-cover" />
    </div>
  );
}
