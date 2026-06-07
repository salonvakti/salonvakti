import { normalizePhoneDigits } from "@/lib/phone/normalize";

/** WhatsApp wa.me bağlantısı için uluslararası rakam dizisi (ör. 905551234567). */
export function toWhatsAppPhoneDigits(phone: string | null | undefined): string | null {
  let digits = normalizePhoneDigits(phone);
  if (!digits) return null;

  if (digits.startsWith("0") && digits.length === 11) {
    digits = `90${digits.slice(1)}`;
  } else if (digits.length === 10 && digits.startsWith("5")) {
    digits = `90${digits}`;
  } else if (digits.startsWith("90") && digits.length === 12) {
    // Türkiye GSM
  } else if (digits.length < 10) {
    return null;
  }

  return digits;
}

export function buildWhatsAppChatUrl(phone: string | null | undefined): string | null {
  const digits = toWhatsAppPhoneDigits(phone);
  if (!digits) return null;
  return `https://wa.me/${digits}`;
}
