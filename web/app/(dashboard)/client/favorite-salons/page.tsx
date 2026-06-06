import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listCustomerFavoriteSalons } from "@/lib/customer/favorite-salons";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ClientFavoriteSalonsPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/customer/login?error=config");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/customer/login?next=/client/favorite-salons");
  }

  const favorites = await listCustomerFavoriteSalons(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Favori salonlar</h1>
        <p className="text-muted-foreground">
          Davet kabul ettiğiniz veya randevu aldığınız işletmeler burada listelenir.
        </p>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Henüz favori salon yok</CardTitle>
            <CardDescription>
              Bir işletmeden davet kabul ettiğinizde veya randevu aldığınızda salon otomatik olarak favorilerinize
              eklenir.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/isletmeler" className={buttonVariants()}>
              İşletmeleri keşfet
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {favorites.map((salon) => (
            <li key={salon.tenantId}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{salon.tenantName}</CardTitle>
                  <CardDescription>
                    {new Date(salon.favoritedAt).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    tarihinde eklendi
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {salon.tenantSlug ? (
                    <>
                      <Link href={`/isletme/${salon.tenantSlug}`} className={buttonVariants({ size: "sm" })}>
                        İşletmeyi gör
                      </Link>
                      <Link
                        href={`/booking/${salon.tenantSlug}`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        Randevu al
                      </Link>
                    </>
                  ) : null}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
