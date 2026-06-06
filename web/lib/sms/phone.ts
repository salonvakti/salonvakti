import { normalizePhoneDigits } from "@/lib/phone/normalize";

/** Netgsm için 5XXXXXXXXX formatı */
export function normalizeTurkishGsm(phone: string | null | undefined): string | null {
  let d = normalizePhoneDigits(phone);
  if (!d) return null;
  if (d.startsWith("90") && d.length === 12) d = d.slice(2);
  if (d.startsWith("0") && d.length === 11) d = d.slice(1);
  if (d.length === 10 && d.startsWith("5")) return d;
  return null;
}
