import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/landing/landing-shared";

export type SalonShowcaseItem = {
  id: string;
  name: string;
  slug: string;
  promoText: string | null;
};

export function LandingSalonsSection({ salons }: { salons: SalonShowcaseItem[] }) {
  return (
    <section id="isletmeler" className="scroll-mt-20 border-b py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            center={false}
            badge="İşletmeler"
            title="Online randevu veren salonlar"
            subtitle="Yayındaki işletmelerin tanıtım sayfasına gidin veya doğrudan randevu oluşturun."
          />
          <Link href="/isletmeler" className={buttonVariants({ variant: "outline" })}>
            Tümünü gör
          </Link>
        </div>
        {salons.length === 0 ? (
          <p className="mt-10 text-muted-foreground">
            Henüz listelenecek işletme yok.{" "}
            <Link href="/register" className="font-medium text-primary underline">
              İlk işletmeyi siz ekleyin
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {salons.map((s) => (
              <li key={s.id}>
                <Card className="h-full overflow-hidden border-muted/60 transition-all hover:border-primary/30 hover:shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      <Link
                        href={`/isletme/${encodeURIComponent(s.slug)}`}
                        className="hover:text-primary"
                      >
                        {s.name}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {s.promoText?.trim() || `${s.name} — online randevu`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <Link
                      href={`/booking/${encodeURIComponent(s.slug)}`}
                      className={buttonVariants({ size: "sm", className: "flex-1" })}
                    >
                      Randevu al
                    </Link>
                    <Link
                      href={`/isletme/${encodeURIComponent(s.slug)}`}
                      className={buttonVariants({ variant: "secondary", size: "sm" })}
                    >
                      Tanıtım
                    </Link>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
