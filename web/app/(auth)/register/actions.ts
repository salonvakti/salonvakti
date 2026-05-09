"use server";

import { registerNewBusiness } from "@/lib/business/self-register";

export async function registerBusinessAction(input: {
  businessName: string;
  slugRaw: string;
  email: string;
  password: string;
}): Promise<{ ok: boolean; error: string | null }> {
  return registerNewBusiness(input);
}
