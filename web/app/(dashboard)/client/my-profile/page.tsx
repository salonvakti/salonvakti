import { redirect } from "next/navigation";
import { ClientProfilesClient } from "./client-profiles-client";
import { getCustomerProfileForUser } from "@/lib/customer/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ClientMyProfilePage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/customer/login?error=config");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/customer/login?next=/client/my-profile");
  }

  const profile = await getCustomerProfileForUser(user);

  return <ClientProfilesClient initial={profile} />;
}
