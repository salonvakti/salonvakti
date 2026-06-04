/** Yıllık fiyat = aylık × 9 (2 ay indirimli yıllık paket) */
export const YEARLY_PRICE_MULTIPLIER = 9;

function parseAmount(raw: string): number | null {
  const normalized = raw.replace(/\./g, "").replace(",", ".");
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function formatTry(amount: number): string {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(amount);
}

type ParsedPrice = {
  prefix: string;
  monthlyAmount: number;
};

/** "1000 TL/Ay", "10 Gün Ücretsiz - 1000 TL/Ay" gibi etiketlerden aylık tutarı çıkarır */
export function parseMonthlyPriceLabel(priceLabel: string): ParsedPrice | null {
  const trimmed = priceLabel.trim();
  const match = trimmed.match(/^(.*?)([\d][\d.,]*)\s*TL(?:\s*\/\s*Ay)?\s*$/i);
  if (!match) return null;

  const monthlyAmount = parseAmount(match[2]);
  if (monthlyAmount === null) return null;

  return {
    prefix: match[1].trim(),
    monthlyAmount,
  };
}

export function getPricingDisplay(
  priceLabel: string,
  yearly: boolean
): { price: string; period: string } {
  const trimmed = priceLabel.trim();
  if (!trimmed || trimmed === "—") {
    return { price: "—", period: yearly ? "/yıl" : "/ay" };
  }

  const parsed = parseMonthlyPriceLabel(trimmed);
  if (!parsed) {
    const withoutAy = trimmed.replace(/\s*\/\s*Ay\s*$/i, "").trim();
    return { price: withoutAy || trimmed, period: yearly ? "/yıl" : "/ay" };
  }

  const amount = yearly
    ? parsed.monthlyAmount * YEARLY_PRICE_MULTIPLIER
    : parsed.monthlyAmount;
  const formatted = `${formatTry(amount)} TL`;
  const price = parsed.prefix ? `${parsed.prefix} ${formatted}` : formatted;

  return { price, period: yearly ? "/yıl" : "/ay" };
}
