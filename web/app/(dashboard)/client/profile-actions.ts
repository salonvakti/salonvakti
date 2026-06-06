"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/auth/session";
import { isCustomerRole } from "@/lib/constants/roles";
import {
  getCustomerProfileForUser,
  saveCustomerProfileForUser,
  type CustomerProfileData,
  type CustomerProfileInput,
} from "@/lib/customer/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function requireCustomerUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false as const, error: "Oturum yapılandırması eksik." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, error: "Oturum yok." };
  }

  const profile = getSessionProfile(user);
  if (!profile || !isCustomerRole(profile.role)) {
    return { ok: false as const, error: "Bu işlem yalnızca müşteri hesapları içindir." };
  }

  return { ok: true as const, user };
}

export async function getCustomerProfileAction(): Promise<{
  ok: boolean;
  profile: CustomerProfileData | null;
  error: string | null;
}> {
  const gate = await requireCustomerUser();
  if (!gate.ok) {
    return { ok: false, profile: null, error: gate.error };
  }

  const profile = await getCustomerProfileForUser(gate.user);
  return { ok: true, profile, error: null };
}

export async function saveCustomerProfileAction(
  input: CustomerProfileInput
): Promise<{ ok: boolean; error: string | null }> {
  const gate = await requireCustomerUser();
  if (!gate.ok) {
    return { ok: false, error: gate.error };
  }

  const result = await saveCustomerProfileForUser(gate.user, input);
  if (!result.ok) {
    return result;
  }

  revalidatePath("/client/my-profile");
  revalidatePath("/client/my-bookings");
  revalidatePath("/account");

  return { ok: true, error: null };
}
