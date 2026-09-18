import { useState } from 'react';
import type { CashFlowCategory, Payment } from '../../types';
import { getCashFlowStatement, getCategoryBreakdown } from '../../lib/cashFlow';

const CATEGORY_LABELS: Record<CashFlowCategory, string> = {
  operating: 'Net cash from operating activities',
  investing: 'Net cash used in investing activities',
  financing: 'Net cash used in financing activities',
};

const formatAmount = (n: number): string =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);

interface PeriodValues {
  lastMonth: number;
  monthToDate: number;
  yearToDate: number;
}

// Detail lines force a fixed tone regardless of the raw number's sign:
// `negative` for outflows (expense breakdowns), `positive` for inflows
// (e.g. Cash received) — each is inherently one semantic category.
// Summary rows (category totals, net change) instead use `signTone` to
// color by the actual computed sign, since those can genuinely go either way.
const toneForValue = (value: number): string => {
  if (value > 0) return 'text-ledger';
  if (value < 0) return 'text-overdue';
  return '';
};

interface RowProps {
  label: string;
  values: PeriodValues;
  bold?: boolean;
  expandable?: boolean;
  expanded?: boolean;
  indent?: boolean;
  negative?: boolean;
  positive?: boolean;
  signTone?: boolean;
  onClick?: () => void;
}

const Row = ({ label, values, bold, expandable, expanded, indent, negative, positive, signTone, onClick }: RowProps) => (
  <tr
    onClick={onClick}
    className={`border-b border-border ${expandable ? 'cursor-pointer hover:bg-ink/5' : ''}`}
  >
    <td className={`px-4 py-2 ${bold ? 'font-semibold' : ''} ${indent ? 'pl-8 text-ink-muted' : ''}`}>
      {expandable && <span className="mr-1 text-ink-faint">{expanded ? '▾' : '▸'}</span>}
      {label}
    </td>
    {(['lastMonth', 'monthToDate', 'yearToDate'] as const).map((key) => {
      const raw = values[key];
      const displayValue = negative && !!raw ? -Math.abs(raw) : positive ? Math.abs(raw) : raw;
      const tone = negative && raw !== 0 ? 'text-overdue' : positive && raw !== 0 ? 'text-ledger' : signTone ? toneForValue(displayValue) : '';
      const formatted = positive && raw !== 0 ? `+${formatAmount(displayValue)}` : formatAmount(displayValue);

      return (
        <td key={key} className={`px-4 py-2 text-right ${bold ? 'font-semibold' : ''} ${tone}`}>
          {formatted}
        </td>
      );
    })}
  </tr>
);

interface CashFlowTableProps {
  payments: Payment[];
}

export const CashFlowTable = ({ payments }: CashFlowTableProps) => {
  const [expandedCategory, setExpandedCategory] = useState<CashFlowCategory | null>(null);

  const statement = getCashFlowStatement(payments);
  const categories: CashFlowCategory[] = ['operating', 'investing', 'financing'];

  const toggleCategory = (category: CashFlowCategory) =>
    setExpandedCategory((prev) => (prev === category ? null : category));

  return (
    <div className="overflow-hidden rounded-instrument border border-border bg-surface">
      <div className="px-4 pt-4">
        <h2 className="text-lg font-semibold text-ink">Cash flow overview</h2>
        <p className="text-sm italic text-ink-faint">
          naive sum across currencies — RSD conversion coming in a later phase
        </p>
      </div>

      <table className="mt-3 w-full text-sm">
        <thead>
          <tr className="border-b border-border text-ink-muted">
            <th className="px-4 py-2 text-left font-medium">Category</th>
            <th className="px-4 py-2 text-right font-medium">Last month</th>
            <th className="px-4 py-2 text-right font-medium">Month to date</th>
            <th className="px-4 py-2 text-right font-medium">Year to date</th>
          </tr>
        </thead>
        <tbody>
          <Row label="Beginning balance" values={statement.beginningBalance} />

          {categories.map((category) => {
            const isExpanded = expandedCategory === category;
            const breakdown = isExpanded ? getCategoryBreakdown(payments, category) : null;

            return (
              <>
                <Row
                  key={category}
                  label={CATEGORY_LABELS[category]}
                  values={statement[category]}
                  expandable
                  expanded={isExpanded}
                  signTone
                  onClick={() => toggleCategory(category)}
                />

                {isExpanded && breakdown && (
                  <>
                    {category === 'operating' && (
                      <Row
                        key={`${category}-income`}
                        label="Cash received"
                        values={breakdown.cashReceived}
                        indent
                        positive
                      />
                    )}
                    {breakdown.expenseLines.map((line) => (
                      <Row
                        key={`${category}-${line.description}`}
                        label={line.description}
                        values={line.values}
                        indent
                        negative
                      />
                    ))}
                    {breakdown.expenseLines.length === 0 && category !== 'operating' && (
                      <tr key={`${category}-empty`} className="border-b border-border">
                        <td colSpan={4} className="px-4 py-2 pl-8 text-xs text-ink-faint">
                          No transactions in this category yet.
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </>
            );
          })}

          <Row label="Net change in cash" values={statement.netChange} bold signTone />
          <Row label="Ending balance" values={statement.endingBalance} bold />
        </tbody>
      </table>
    </div>
  );
};