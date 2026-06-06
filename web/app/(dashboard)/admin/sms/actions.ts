"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/auth/session";
import { loadTenantFeaturesById } from "@/lib/features";
import { sendNetgsmOtpSms } from "@/lib/sms/netgsm-client";
import {
  mergeNetgsmIntoSettingsJson,
  parseNetgsmFromSettingsJson,
  toPublicNetgsmConfig,
  type NetgsmTenantConfigPublic,
} from "@/lib/sms/netgsm-settings";
import {
  canSendSmsByQuota,
  countTenantSmsThisMonth,
  getSmsQuotaLabel,
  hasSmsPackage,
  remainingSmsQuota,
} from "@/lib/sms/sms-quota";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizePlanType } from "@/lib/features";
import type { PlanType, ResolvedTenantFeatures } from "@/types/features";

export type SmsLogRow = {
  id: string;
  recipientPhone: string;
  message: string;
  status: "sent" | "failed";
  netgsmJobId: string | null;
  netgsmCode: string | null;
  netgsmDescription: string | null;
  createdAt: string;
};

export type SmsDashboardData = {
  planType: PlanType;
  features: ResolvedTenantFeatures;
  config: NetgsmTenantConfigPublic;
  sentThisMonth: number;
  remaining: number | null;
  quotaLabel: string;
  logs: SmsLogRow[];
};

async function requireBusinessAdmin() {
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
  if (profile?.role !== "business_admin" || !profile.tenantId) {
    return { ok: false as const, error: "Bu işlem için işletme yöneticisi gerekli." };
  }

  return { ok: true as const, user, tenantId: profile.tenantId };
}

export async function getSmsDashboardAction(): Promise<{
  ok: boolean;
  data: SmsDashboardData | null;
  error: string | null;
}> {
  const gate = await requireBusinessAdmin();
  if (!gate.ok) {
    return { ok: false, data: null, error: gate.error };
  }

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return { ok: false, data: null, error: "Sunucu yapılandırması eksik." };
  }

  const [{ features }, { data: tenant }, sentThisMonth, { data: logs, error: logErr }] =
    await Promise.all([
      loadTenantFeaturesById(admin, gate.tenantId),
      admin
        .from("tenants")
        .select("settings_json,plan_type,license_plan")
        .eq("id", gate.tenantId)
        .maybeSingle(),
      countTenantSmsThisMonth(gate.tenantId),
      admin
        .from("tenant_sms_messages")
        .select(
          "id,recipient_phone,message,status,netgsm_job_id,netgsm_code,netgsm_description,created_at"
        )
        .eq("tenant_id", gate.tenantId)
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

  if (logErr) {
    return { ok: false, data: null, error: logErr.message };
  }

  const netgsm = parseNetgsmFromSettingsJson(
    (tenant as { settings_json?: unknown } | null)?.settings_json
  );

  const tenantRow = tenant as {
    settings_json?: unknown;
    plan_type?: string | null;
    license_plan?: string | null;
  } | null;
  const planType = normalizePlanType(tenantRow?.plan_type ?? tenantRow?.license_plan);

  return {
    ok: true,
    data: {
      planType,
      features,
      config: toPublicNetgsmConfig(netgsm),
      sentThisMonth,
      remaining: remainingSmsQuota(features, sentThisMonth),
      quotaLabel: getSmsQuotaLabel(features),
      logs: (logs ?? []).map((r) => ({
        id: r.id as string,
        recipientPhone: r.recipient_phone as string,
        message: r.message as string,
        status: r.status as "sent" | "failed",
        netgsmJobId: (r.netgsm_job_id as string | null) ?? null,
        netgsmCode: (r.netgsm_code as string | null) ?? null,
        netgsmDescription: (r.netgsm_description as string | null) ?? null,
        createdAt: r.created_at as string,
      })),
    },
    error: null,
  };
}

export async function saveNetgsmSettingsAction(input: {
  usercode: string;
  password: string | null;
  msgheader: string;
  appname: string | null;
  enabled: boolean;
}): Promise<{ ok: boolean; error: string | null }> {
  const gate = await requireBusinessAdmin();
  if (!gate.ok) {
    return { ok: false, error: gate.error };
  }

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return { ok: false, error: "Sunucu yapılandırması eksik." };
  }

  const { features } = await loadTenantFeaturesById(admin, gate.tenantId);
  if (!hasSmsPackage(features)) {
    return { ok: false, error: "Netgsm ayarları yalnızca Pro ve Ultimate paketlerde kullanılabilir." };
  }

  const usercode = input.usercode.trim();
  const msgheader = input.msgheader.trim();
  if (!usercode || !msgheader) {
    return { ok: false, error: "Kullanıcı kodu ve mesaj başlığı zorunludur." };
  }

  const { data: row } = await admin
    .from("tenants")
    .select("settings_json")
    .eq("id", gate.tenantId)
    .maybeSingle();

  const previous = parseNetgsmFromSettingsJson(
    (row as { settings_json?: unknown } | null)?.settings_json
  );
  const password = input.password?.trim();
  if (!password && !previous?.password) {
    return { ok: false, error: "API şifresi gerekli." };
  }

  const settings_json = mergeNetgsmIntoSettingsJson(
    (row as { settings_json?: unknown } | null)?.settings_json,
    {
      usercode,
      password: password || null,
      msgheader,
      appname: input.appname,
      enabled: input.enabled,
    },
    previous
  );

  const { error } = await admin
    .from("tenants")
    .update({ settings_json })
    .eq("id", gate.tenantId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/admin/sms");

  return { ok: true, error: null };
}

export async function sendTenantSmsAction(input: {
  phone: string;
  message: string;
}): Promise<{ ok: boolean; error: string | null }> {
  const gate = await requireBusinessAdmin();
  if (!gate.ok) {
    return { ok: false, error: gate.error };
  }

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return { ok: false, error: "Sunucu yapılandırması eksik." };
  }

  const { features } = await loadTenantFeaturesById(admin, gate.tenantId);
  const sentThisMonth = await countTenantSmsThisMonth(gate.tenantId);
  const quotaGate = canSendSmsByQuota(features, sentThisMonth);
  if (!quotaGate.ok) {
    return { ok: false, error: quotaGate.error };
  }

  const { data: tenant } = await admin
    .from("tenants")
    .select("settings_json")
    .eq("id", gate.tenantId)
    .maybeSingle();

  const config = parseNetgsmFromSettingsJson(
    (tenant as { settings_json?: unknown } | null)?.settings_json
  );

  if (!config || !config.enabled) {
    return { ok: false, error: "Netgsm ayarları eksik veya devre dışı. Ayarlar sayfasından yapılandırın." };
  }

  const result = await sendNetgsmOtpSms(config, input.phone, input.message);

  const { error: insErr } = await admin.from("tenant_sms_messages").insert({
    tenant_id: gate.tenantId,
    recipient_phone: input.phone.trim(),
    message: input.message.trim().slice(0, 160),
    status: result.ok ? "sent" : "failed",
    netgsm_job_id: result.jobId,
    netgsm_code: result.code,
    netgsm_description: result.description,
    sent_by_user_id: gate.user.id,
  });

  if (insErr) {
    return { ok: false, error: insErr.message };
  }

  revalidatePath("/admin/sms");

  if (!result.ok) {
    return { ok: false, error: result.description || "SMS gönderilemedi." };
  }

  return { ok: true, error: null };
}
