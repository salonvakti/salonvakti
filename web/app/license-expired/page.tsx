import Link from "next/link";
import { LicenseExpiredSignOut } from "./license-expired-sign-out";

export default function LicenseExpiredPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-foreground">
      <h1 className="text-2xl font-semibold tracking-tight">Lisans süresi doldu</h1>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        İşletme lisansınızın tanımlı bitiş tarihi geçti veya henüz başlamadı. İşletme paneline
        erişmek için platform yöneticinizden lisansınızı yenilemesini isteyin.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <LicenseExpiredSignOut />
        <Link href="/" className="text-sm underline underline-offset-4">
          Ana sayfa
        </Link>
      </div>
    </div>
  );
}
