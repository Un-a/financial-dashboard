import type { CurrencyCode } from '../types';

export const PAUSAL_LIMIT_RSD = 6_000_000;
export const VAT_LIMIT_RSD = 8_000_000;

// Hardcoded NBS official mid-rate, snapshot dated 2026-08-25.
export const HARDCODED_EXCHANGE_RATES: Record<CurrencyCode, number> = {
  RSD: 1,
  EUR: 117.3772,
  USD: 100.6925,
};

export const NBS_RATE_SNAPSHOT_DATE = '2026-08-25';

// Convenience converter for Phase 1 — naive, no date awareness.
// currency -> RSD -> target currency.
export const convertHardcoded = (
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
): number => {
  if (from === to) return amount;
  const amountInRsd = amount * HARDCODED_EXCHANGE_RATES[from];
  return amountInRsd / HARDCODED_EXCHANGE_RATES[to];
};