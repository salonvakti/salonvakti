import { SiteFooter } from "@/components/common/SiteFooter";
import { SiteHeader } from "@/components/common/SiteHeader";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingSalonClient } from "@/components/booking/BookingSalonClient";

type Props = { params: { salonSlug: string } };

export function generateMetadata({ params }: Props): Metadata {
  const slug = decodeURIComponent(params.salonSlug);
  const prettyName =
    slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ") + " Salonu";
  return {
    title: `${prettyName} randevusu | SalonVakti`,
    description: "Salon rezervasyonu — SalonVakti",
  };
}

export default function BookingSalonPage({ params }: Props) {
  const slug = decodeURIComponent(params.salonSlug);
  if (!slug) notFound();

  const prettyName =
    slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ") + " Salonu";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="border-b bg-muted/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10">
          <p className="text-sm text-muted-foreground">
            <Link href="/" className="underline underline-offset-4">
              SalonVakti
            </Link>{" "}
            / rezervasyon
          </p>
        </div>
      </div>
      <BookingSalonClient salonSlug={slug} salonName={prettyName} />
      <SiteFooter />
    </div>
  );
}
