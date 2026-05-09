"use client";

import { useRouter } from "next/navigation";
import { useSupabaseContext } from "@/components/providers/supabase-provider";
import { Button } from "@/components/ui/button";

export function LicenseExpiredSignOut() {
  const router = useRouter();
  const { client } = useSupabaseContext();

  return (
    <Button
      type="button"
      onClick={() => {
        void (async () => {
          await client?.auth.signOut();
          router.push("/login?reason=license_expired");
          router.refresh();
        })();
      }}
    >
      Çıkış yap
    </Button>
  );
}
