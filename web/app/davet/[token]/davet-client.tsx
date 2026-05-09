"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { acceptClientInviteAction } from "@/app/davet/actions";
import { SiteFooter } from "@/components/common/SiteFooter";
import { SiteHeader } from "@/components/common/SiteHeader";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DavetClient({
  token,
  tenantName,
  clientName,
  expired,
  alreadyLinked,
  isLoggedIn,
}: {
  token: string;
  tenantName: string;
  clientName: string;
  expired: boolean;
  alreadyLinked: boolean;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onAccept() {
    setErr(null);
    startTransition(async () => {
      const res = await acceptClientInviteAction(token);
      if (!res.ok) {
        setErr(res.error ?? "İşlem başarısız.");
        return;
      }
      router.push("/client/my-bookings");
      router.refresh();
    });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Müşteri daveti</CardTitle>
            <CardDescription>
              {tenantName ? (
                <>
                  <span className="font-medium text-foreground">{tenantName}</span> işletmesi sizi müşteri olarak
                  davet ediyor.
                </>
              ) : (
                "İşletme daveti"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              Kayıt: <span className="font-medium text-foreground">{clientName}</span>
            </p>

            {alreadyLinked ? (
              <p className="text-muted-foreground">Bu davet zaten bir hesaba bağlanmış.</p>
            ) : expired ? (
              <p className="text-destructive">Bu davetin süresi dolmuş. İşletmeden yeni davet isteyin.</p>
            ) : !isLoggedIn ? (
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Hesabınızı bağlamak için müşteri girişi yapın veya müşteri kaydı oluşturun.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link
                    href={`/customer/login?next=${encodeURIComponent(`/davet/${encodeURIComponent(token)}`)}`}
                    className={buttonVariants({ className: "inline-flex flex-1 justify-center" })}
                  >
                    Müşteri girişi
                  </Link>
                  <Link
                    href={`/customer/register?next=${encodeURIComponent(`/davet/${encodeURIComponent(token)}`)}`}
                    className={buttonVariants({ variant: "outline", className: "inline-flex flex-1 justify-center" })}
                  >
                    Müşteri kaydı
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Oturumunuzu bu müşteri kaydıyla eşleştirmek için onaylayın. Sonrasında randevularınız{" "}
                  <Link href="/client/my-bookings" className="font-medium text-primary underline">
                    Randevularım
                  </Link>{" "}
                  üzerinden görünür.
                </p>
                {err ? <p className="text-sm text-destructive">{err}</p> : null}
                <button
                  type="button"
                  className={buttonVariants({ className: "w-full" })}
                  disabled={pending}
                  onClick={() => onAccept()}
                >
                  {pending ? "Bağlanıyor…" : "Hesabımı bağla"}
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
