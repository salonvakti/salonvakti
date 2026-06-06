"use client";

import { useRouter } from "next/navigation";
import { CustomerProfileForm } from "@/components/customer/CustomerProfileForm";
import type { CustomerProfileData } from "@/lib/customer/profile";

export function ClientProfilesClient({ initial }: { initial: CustomerProfileData }) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profilim</h1>
        <p className="text-muted-foreground">
          Kişisel ve sağlık bilgileriniz tek profilde tutulur; bağlı tüm işletmelerde aynı ad soyad ve iletişim
          bilgileri kullanılır.
        </p>
      </div>

      <CustomerProfileForm
        initial={initial}
        showLinkedSalons
        onSaved={() => router.refresh()}
      />
    </div>
  );
}
