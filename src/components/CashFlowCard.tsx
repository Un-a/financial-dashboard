import type { Account, CurrencyCode } from '../types';

interface CashFlowCardProps {
  accounts: Account[];
}

const formatAmount = (amount: number, currency: CurrencyCode): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const CashFlowCard = ({ accounts }: CashFlowCardProps) => {
  // Group balances by currency. Real conversion to a single display currency
  // is deferred to Phase 2 (useCurrencyStore) — for now we show totals
  // per currency separately to avoid showing a misleading single number.
  const totalsByCurrency = accounts.reduce<Record<string, number>>((acc, account) => {
    acc[account.currency] = (acc[account.currency] ?? 0) + account.balance;
    return acc;
  }, {});

  const currencies = Object.keys(totalsByCurrency) as CurrencyCode[];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-medium text-gray-500">Total Cash Flow</h2>

      <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
        {currencies.map((currency) => (
          <div key={currency}>
            <span className="text-2xl font-semibold text-gray-900">
              {formatAmount(totalsByCurrency[currency], currency)}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-2 text-xs text-gray-400">
        Shown per currency — conversion to a single total is coming in a later phase.
      </p>
    </div>
  );
};