import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 text-sm text-muted-foreground md:flex-row md:items-start">
        <div className="text-center md:text-left">
          <p className="font-medium text-foreground">SalonVakti</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Tüm hakları saklıdır.</p>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Alt navigasyon">
          <Link href="/" className="hover:text-foreground">
            Ana sayfa
          </Link>
          <Link href="/isletmeler" className="hover:text-foreground">
            İşletmeler
          </Link>
          <Link href="/#paketler" className="hover:text-foreground">
            Paketler
          </Link>
          <Link href="/login" className="hover:text-foreground">
            Giriş
          </Link>
          <Link href="/register" className="hover:text-foreground">
            İşletme oluştur
          </Link>
        </nav>
      </div>
    </footer>
  );
}
