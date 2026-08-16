import type { Payment } from '../types';
import { getSimpleCashFlowSummary } from '../lib/cashFlow';

const formatAmount = (n: number): string =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);

interface CashFlowSummaryTableProps {
  payments: Payment[];
}

export const CashFlowSummaryTable = ({ payments }: CashFlowSummaryTableProps) => {
  const summary = getSimpleCashFlowSummary(payments);

  const rows: { label: string; lastMonth: number; monthToDate: number; yearToDate: number; bold?: boolean }[] = [
    { label: 'Beginning balance', ...summary.beginningBalance },
    { label: 'Income', ...summary.income },
    { label: 'Expense', lastMonth: -summary.expense.lastMonth, monthToDate: -summary.expense.monthToDate, yearToDate: -summary.expense.yearToDate },
    { label: 'Ending balance', ...summary.endingBalance, bold: true },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="px-4 pt-4">
        <h2 className="text-lg font-semibold text-gray-900">Cash flow</h2>
                <p className="text-sm italic text-gray-400">
          naive sum across currencies — RSD conversion coming in a later phase
        </p>
      </div>

      <table className="mt-3 w-full text-sm">
        <thead>
          <tr className="text-gray-500">
            <th className="px-4 py-2 text-left font-medium">&nbsp;</th>
            <th className="px-4 py-2 text-right font-medium">Last month</th>
            <th className="px-4 py-2 text-right font-medium">Month to date</th>
            <th className="px-4 py-2 text-right font-medium">Year to date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-gray-100 last:border-0">
              <td className={`px-4 py-2 ${row.bold ? 'font-semibold' : ''}`}>{row.label}</td>
              <td className={`px-4 py-2 text-right ${row.bold ? 'font-semibold' : ''} ${row.lastMonth < 0 ? 'text-red-600' : ''}`}>
                {formatAmount(row.lastMonth)}
              </td>
              <td className={`px-4 py-2 text-right ${row.bold ? 'font-semibold' : ''} ${row.monthToDate < 0 ? 'text-red-600' : ''}`}>
                {formatAmount(row.monthToDate)}
              </td>
              <td className={`px-4 py-2 text-right ${row.bold ? 'font-semibold' : ''} ${row.yearToDate < 0 ? 'text-red-600' : ''}`}>
                {formatAmount(row.yearToDate)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};