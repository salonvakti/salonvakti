"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/landing/landing-shared";
import { getPricingDisplay } from "@/lib/landing/pricing-display";
import { cn } from "@/lib/utils";
import type { LandingPackageSlug } from "@/lib/landing/package-prices";

type Plan = {
  slug: LandingPackageSlug;
  name: string;
  tagline: string;
  priceLabel: string;
  features: string[];
  audience: string;
  highlighted?: boolean;
  badge?: string;
};

type Props = {
  plans: Plan[];
  promoLine?: string;
};

export function LandingPricing({ plans, promoLine }: Props) {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="paketler" className="scroll-mt-20 border-b bg-muted/20 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          badge="Paketler"
          title="İşletmenize uygun planı seçin"
          subtitle="Tüm paketlerde çekirdek online randevu ve salon yönetimi altyapısı dahildir."
        />
        {promoLine ? (
          <p className="mx-auto mt-6 max-w-3xl text-center text-sm font-semibold text-foreground md:text-base">
            {promoLine}
          </p>
        ) : null}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex rounded-full border bg-background p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-colors",
                !yearly ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"
              )}
            >
              Aylık
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-colors",
                yearly ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"
              )}
            >
              Yıllık
            </button>
          </div>
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:items-stretch">
          {plans.map((plan) => (
            <PricingCard key={plan.slug} plan={plan} yearly={yearly} />
          ))}
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Link href="/register" className={buttonVariants({ size: "lg" })}>
            Ücretsiz dene
          </Link>
          <Link href="/login" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Panele gir
          </Link>
        </div>
      </div>
    </section>
  );
}

function PricingCard({ plan, yearly }: { plan: Plan; yearly: boolean }) {
  const { price, period } = getPricingDisplay(plan.priceLabel, yearly);

  return (
    <Card
      className={cn(
        "relative flex h-full flex-col overflow-visible rounded-2xl transition-shadow hover:shadow-xl",
        plan.highlighted
          ? "border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/20"
          : "border-muted/80"
      )}
    >
      {plan.badge ? (
        <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
          {plan.badge}
        </div>
      ) : null}
      <CardHeader className={cn("text-center", plan.highlighted && "pt-8")}>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription className="text-base">{plan.tagline}</CardDescription>
        <p className="pt-4 text-3xl font-extrabold tracking-tight text-primary">
          {price}
          <span className="text-base font-normal text-muted-foreground">{period}</span>
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-6">
        <ul className="flex-1 space-y-3 text-sm">
          {plan.features.slice(0, 6).map((line) => (
            <li key={line} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">{plan.audience}</p>
        <Link
          href="/register"
          className={buttonVariants({
            variant: plan.highlighted ? "default" : "outline",
            className: "w-full",
          })}
        >
          {plan.highlighted ? "Pro ile başla" : "Seç"}
        </Link>
      </CardContent>
    </Card>
  );
}
