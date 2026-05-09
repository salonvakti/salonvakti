/** Telefon eşleştirmesi için rakam dizisi (ülke kodu bilinmiyorsa ham rakamlar). */
export function normalizePhoneDigits(input: string | null | undefined): string {
  if (!input) return "";
  return input.replace(/\D/g, "");
}
