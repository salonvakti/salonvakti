import Link from "next/link";
import { SiteFooter } from "@/components/common/SiteFooter";
import { SiteHeader } from "@/components/common/SiteHeader";
import { buttonVariants } from "@/components/ui/button";

export default function IsletmeNotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">İşletme bulunamadı</h1>
        <p className="max-w-md text-muted-foreground">
          Bu adrese ait aktif bir işletme tanıtım sayfası yok veya yayında değil.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/isletmeler" className={buttonVariants()}>
            İşletme listesi
          </Link>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Ana sayfa
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
