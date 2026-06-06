import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/common/SiteFooter";
import { SiteHeader } from "@/components/common/SiteHeader";
import { buttonVariants } from "@/components/ui/button";
import { getPublicSiteSettings } from "@/lib/platform/public-site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getPublicSiteSettings();
  return {
    title: `KVKK Aydınlatma Metni — ${site.copy.siteName}`,
    description: "Kişisel verilerin işlenmesine ilişkin aydınlatma ve açık rıza metni.",
    robots: { index: true, follow: true },
  };
}

export default async function KvkkPage() {
  const site = await getPublicSiteSettings();
  const text = site.legal.kvkkText;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
          <div className="mb-8 space-y-3">
            <h1 className="text-3xl font-bold tracking-tight">KVKK Aydınlatma ve Açık Rıza Metni</h1>
            <p className="text-sm text-muted-foreground">
              {site.copy.siteName} platformu — kişisel verilerinizin işlenmesine ilişkin bilgilendirme.
            </p>
          </div>

          <article className="rounded-xl border bg-card p-6 shadow-sm md:p-8">
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{text}</div>
          </article>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className={buttonVariants({ variant: "outline" })}>
              Ana sayfa
            </Link>
            <Link href="/customer/login" className={buttonVariants()}>
              Müşteri girişi
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter variant="landing" />
    </div>
  );
}
