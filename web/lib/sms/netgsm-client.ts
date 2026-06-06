import "server-only";

import { normalizeTurkishGsm } from "@/lib/sms/phone";
import type { NetgsmTenantConfig } from "@/lib/sms/netgsm-settings";

const OTP_URL = "https://api.netgsm.com.tr/sms/send/otp";
const MAX_MSG_LEN = 160;

export type NetgsmSendResult = {
  ok: boolean;
  jobId: string | null;
  code: string | null;
  description: string;
};

function parseNetgsmResponseBody(body: string): { code: string | null; jobId: string | null; description: string } {
  const trimmed = body.trim();
  if (!trimmed) {
    return { code: null, jobId: null, description: "Boş yanıt" };
  }

  // JSON yanıt
  if (trimmed.startsWith("{")) {
    try {
      const j = JSON.parse(trimmed) as Record<string, unknown>;
      const code = j.code != null ? String(j.code) : null;
      const jobId =
        (j.jobid != null ? String(j.jobid) : null) ||
        (j.jobId != null ? String(j.jobId) : null) ||
        (j.bulkid != null ? String(j.bulkid) : null);
      const description =
        (typeof j.description === "string" && j.description) ||
        (typeof j.durum === "string" && j.durum) ||
        (typeof j.aciklama === "string" && j.aciklama) ||
        trimmed;
      return { code, jobId, description };
    } catch {
      return { code: null, jobId: null, description: trimmed };
    }
  }

  // "00 123456" veya "00" metin yanıtı
  const parts = trimmed.split(/\s+/);
  const code = parts[0] ?? null;
  const jobId = parts[1] && /^\d+$/.test(parts[1]) ? parts[1] : null;
  return { code, jobId, description: trimmed };
}

export async function sendNetgsmOtpSms(
  config: NetgsmTenantConfig,
  phone: string,
  message: string
): Promise<NetgsmSendResult> {
  const no = normalizeTurkishGsm(phone);
  if (!no) {
    return { ok: false, jobId: null, code: null, description: "Geçersiz telefon numarası." };
  }

  const msg = message.trim().slice(0, MAX_MSG_LEN);
  if (!msg) {
    return { ok: false, jobId: null, code: null, description: "Mesaj boş olamaz." };
  }

  const params = new URLSearchParams({
    usercode: config.usercode,
    password: config.password,
    msgheader: config.msgheader,
    msg,
    no,
  });
  if (config.appname) params.set("appname", config.appname);

  const url = `${OTP_URL}?${params.toString()}`;

  try {
    const res = await fetch(url, { method: "GET", cache: "no-store" });
    const body = await res.text();
    const parsed = parseNetgsmResponseBody(body);
    const ok = parsed.code === "00" || body.toLowerCase().includes("başarı");
    return {
      ok,
      jobId: parsed.jobId,
      code: parsed.code,
      description: parsed.description,
    };
  } catch (e) {
    const description = e instanceof Error ? e.message : "Netgsm bağlantı hatası";
    return { ok: false, jobId: null, code: null, description };
  }
}
