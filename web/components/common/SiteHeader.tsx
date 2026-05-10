import Link from "next/link";
import { Building2 } from "lucide-react";
import { SitePromoStrip } from "@/components/common/SitePromoStrip";
import { buttonVariants } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
      <SitePromoStrip />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Building2 className="h-6 w-6" aria-hidden />
          <span>SalonVakti</span>
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-2 text-sm">
          <Link href="/#paketler" className={buttonVariants({ variant: "ghost" })}>
            Paketler
          </Link>
          <Link href="/isletmeler" className={buttonVariants({ variant: "ghost" })}>
            İşletmeler
          </Link>
          <Link href="/customer/login" className={buttonVariants({ variant: "ghost" })}>
            Müşteri girişi
          </Link>
          <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
            İşletme girişi
          </Link>
          <Link href="/register" className={buttonVariants()}>
            İşletme oluştur
          </Link>
        </nav>
      </div>
    </header>
  );
}
