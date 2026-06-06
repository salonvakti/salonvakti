import "server-only";

import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";

export {
  canSendSmsByQuota,
  getSmsQuotaLabel,
  hasSmsPackage,
  remainingSmsQuota,
} from "@/lib/sms/sms-quota-shared";

function monthStartIso(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export async function countTenantSmsThisMonth(tenantId: string): Promise<number> {
  const admin = createServiceRoleSupabaseClient();
  if (!admin) return 0;

  const { count, error } = await admin
    .from("tenant_sms_messages")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("status", "sent")
    .gte("created_at", monthStartIso());

  if (error) return 0;
  return count ?? 0;
}
