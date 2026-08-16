// src/components/CashFlowTable.tsx

import { useState } from 'react';
import type { CashFlowCategory, Payment } from '../types';
import { getCashFlowStatement, getCategoryBreakdown } from '../lib/cashFlow';

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

interface RowProps {
  label: string;
  values: PeriodValues;
  bold?: boolean;
  expandable?: boolean;
  expanded?: boolean;
  indent?: boolean;
  negative?: boolean;
  onClick?: () => void;
}

const Row = ({ label, values, bold, expandable, expanded, indent, negative, onClick }: RowProps) => (
  <tr
    onClick={onClick}
    className={`border-b border-gray-100 ${expandable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
  >
    <td className={`px-4 py-2 ${bold ? 'font-semibold' : ''} ${indent ? 'pl-8 text-gray-600' : ''}`}>
      {expandable && <span className="mr-1 text-gray-400">{expanded ? '▾' : '▸'}</span>}
      {label}
    </td>
    {(['lastMonth', 'monthToDate', 'yearToDate'] as const).map((key) => (
      <td
        key={key}
        className={`px-4 py-2 text-right ${bold ? 'font-semibold' : ''} ${
          negative && values[key] !== 0 ? 'text-red-600' : ''
        }`}
      >
        {formatAmount(negative && !!values[key] ? -Math.abs(values[key]) : values[key])}
      </td>
    ))}
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
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="px-4 pt-4">
        <h2 className="text-lg font-semibold text-gray-900">Cash flow overview</h2>
        <p className="text-sm italic text-gray-400">
          naive sum across currencies — RSD conversion coming in a later phase
        </p>
      </div>

      <table className="mt-3 w-full text-sm">
        <thead>
          <tr className="bg-indigo-900 text-white">
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
                        negative
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
                      <tr key={`${category}-empty`}>
                        <td colSpan={4} className="px-4 py-2 pl-8 text-xs text-gray-400">
                          No transactions in this category yet.
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </>
            );
          })}

          <Row label="Net change in cash" values={statement.netChange} bold />
          <Row label="Ending balance" values={statement.endingBalance} bold />
        </tbody>
      </table>
    </div>
  );
};