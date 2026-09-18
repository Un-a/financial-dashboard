import type { Payment } from '../../types';
import { getSimpleCashFlowSummary } from '../../lib/cashFlow';

const formatAmount = (n: number): string =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);

interface CashFlowSummaryTableProps {
  payments: Payment[];
}

export const CashFlowSummaryTable = ({ payments }: CashFlowSummaryTableProps) => {
  const summary = getSimpleCashFlowSummary(payments);

  type Tone = 'ledger' | 'overdue' | 'neutral';

  const toneClass: Record<Tone, string> = {
    ledger: 'text-ledger',
    overdue: 'text-overdue',
    neutral: '',
  };

  const rows: { label: string; lastMonth: number; monthToDate: number; yearToDate: number; bold?: boolean; tone: Tone }[] = [
    { label: 'Beginning balance', ...summary.beginningBalance, tone: 'neutral' },
    { label: 'Income', ...summary.income, tone: 'ledger' },
    {
      label: 'Expense',
      lastMonth: -summary.expense.lastMonth,
      monthToDate: -summary.expense.monthToDate,
      yearToDate: -summary.expense.yearToDate,
      tone: 'overdue',
    },
    { label: 'Ending balance', ...summary.endingBalance, bold: true, tone: 'neutral' },
  ];

  return (
    <div className="overflow-hidden rounded-instrument border border-border bg-surface">
      <div className="px-4 pt-4">
        <h2 className="text-lg font-semibold text-ink">Cash flow</h2>
        <p className="text-sm italic text-ink-faint">
          naive sum across currencies — RSD conversion coming in a later phase
        </p>
      </div>

      <table className="mt-3 w-full text-sm">
        <thead>
          <tr className="text-ink-muted">
            <th className="px-4 py-2 text-left font-medium">&nbsp;</th>
            <th className="px-4 py-2 text-right font-medium">Last month</th>
            <th className="px-4 py-2 text-right font-medium">Month to date</th>
            <th className="px-4 py-2 text-right font-medium">Year to date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-border last:border-0">
              <td className={`px-4 py-2 ${row.bold ? 'font-semibold' : ''}`}>{row.label}</td>
              <td className={`px-4 py-2 text-right ${row.bold ? 'font-semibold' : ''} ${toneClass[row.tone]}`}>
                {formatAmount(row.lastMonth)}
              </td>
              <td className={`px-4 py-2 text-right ${row.bold ? 'font-semibold' : ''} ${toneClass[row.tone]}`}>
                {formatAmount(row.monthToDate)}
              </td>
              <td className={`px-4 py-2 text-right ${row.bold ? 'font-semibold' : ''} ${toneClass[row.tone]}`}>
                {formatAmount(row.yearToDate)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};