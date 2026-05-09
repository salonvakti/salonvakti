"use server";

import { registerCustomerUser } from "@/lib/customer/register-customer";

export async function registerCustomerAction(input: {
  email: string;
  password: string;
  displayName: string | null;
}): Promise<{ ok: boolean; error: string | null }> {
  return registerCustomerUser(input);
}
