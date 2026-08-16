import type { CashFlowCategory, Payment } from '../types';

// NOTE: all sums are naive across currencies (no RSD conversion yet) —
// same limitation as taxLimitStore.ts, to be addressed in Phase 2.

interface PeriodRange {
  label: string;
  startDate: Date;
  endDate: Date;
}

interface PeriodRanges {
  lastMonth: PeriodRange;
  monthToDate: PeriodRange;
  yearToDate: PeriodRange;
}

const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const dayBefore = (date: Date): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return endOfDay(d);
};

export const getPeriodRanges = (referenceDate: Date): PeriodRanges => {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();

  const lastMonthStart = new Date(year, month - 1, 1);
  const lastMonthEnd = new Date(year, month, 0); // day 0 = last day of previous month

  return {
    lastMonth: {
      label: 'Last month',
      startDate: startOfDay(lastMonthStart),
      endDate: endOfDay(lastMonthEnd),
    },
    monthToDate: {
      label: 'Month to date',
      startDate: startOfDay(new Date(year, month, 1)),
      endDate: endOfDay(referenceDate),
    },
    yearToDate: {
      label: 'Year to date',
      startDate: startOfDay(new Date(year, 0, 1)),
      endDate: endOfDay(referenceDate),
    },
  };
};

const parseISODate = (isoDate: string): Date => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Inflow is positive, outflow is negative.
const signedAmount = (payment: Payment): number =>
  payment.direction === 'in' ? payment.amount : -payment.amount;

// Cumulative cash position from the earliest tracked payment up to (and
// including) asOfDate. There's no "real" opening balance before the mock
// dataset — the tracked history is treated as the entire ledger.
export const getCashPosition = (payments: Payment[], asOfDate: Date): number => {
  return payments
    .filter((p) => parseISODate(p.date) <= asOfDate)
    .reduce((sum, p) => sum + signedAmount(p), 0);
};

export const getNetCashByCategory = (
  payments: Payment[],
  category: CashFlowCategory,
  start: Date,
  end: Date,
): number => {
  return payments
    .filter((p) => p.category === category && parseISODate(p.date) >= start && parseISODate(p.date) <= end)
    .reduce((sum, p) => sum + signedAmount(p), 0);
};

export const getCategoryDetail = (
  payments: Payment[],
  category: CashFlowCategory,
  start: Date,
  end: Date,
): Payment[] => {
  return payments
    .filter((p) => p.category === category && parseISODate(p.date) >= start && parseISODate(p.date) <= end)
    .sort((a, b) => a.date.localeCompare(b.date));
};

export interface PeriodValues {
  lastMonth: number;
  monthToDate: number;
  yearToDate: number;
}

export interface CashFlowStatement {
  beginningBalance: PeriodValues;
  operating: PeriodValues;
  investing: PeriodValues;
  financing: PeriodValues;
  netChange: PeriodValues;
  endingBalance: PeriodValues;
}

export const getCashFlowStatement = (
  payments: Payment[],
  referenceDate: Date = new Date(),
): CashFlowStatement => {
  const periods = getPeriodRanges(referenceDate);
  const periodKeys = ['lastMonth', 'monthToDate', 'yearToDate'] as const;

  const beginningBalance = {} as PeriodValues;
  const operating = {} as PeriodValues;
  const investing = {} as PeriodValues;
  const financing = {} as PeriodValues;
  const netChange = {} as PeriodValues;
  const endingBalance = {} as PeriodValues;

  periodKeys.forEach((key) => {
    const { startDate, endDate } = periods[key];

    beginningBalance[key] = getCashPosition(payments, dayBefore(startDate));
    operating[key] = getNetCashByCategory(payments, 'operating', startDate, endDate);
    investing[key] = getNetCashByCategory(payments, 'investing', startDate, endDate);
    financing[key] = getNetCashByCategory(payments, 'financing', startDate, endDate);
    netChange[key] = operating[key] + investing[key] + financing[key];
    endingBalance[key] = beginningBalance[key] + netChange[key];
  });

  return { beginningBalance, operating, investing, financing, netChange, endingBalance };
};

// ===== Simplified summary (for the main dashboard) =====

export interface SimpleCashFlowSummary {
  beginningBalance: PeriodValues;
  income: PeriodValues;
  expense: PeriodValues; // positive number — UI renders it with a minus sign
  endingBalance: PeriodValues;
}

export const getSimpleCashFlowSummary = (
  payments: Payment[],
  referenceDate: Date = new Date(),
): SimpleCashFlowSummary => {
  const periods = getPeriodRanges(referenceDate);
  const periodKeys = ['lastMonth', 'monthToDate', 'yearToDate'] as const;

  const beginningBalance = {} as PeriodValues;
  const income = {} as PeriodValues;
  const expense = {} as PeriodValues;
  const endingBalance = {} as PeriodValues;

  periodKeys.forEach((key) => {
    const { startDate, endDate } = periods[key];
    beginningBalance[key] = getCashPosition(payments, dayBefore(startDate));

    const inPeriod = payments.filter(
      (p) => parseISODate(p.date) >= startDate && parseISODate(p.date) <= endDate,
    );
    income[key] = inPeriod.filter((p) => p.direction === 'in').reduce((s, p) => s + p.amount, 0);
    expense[key] = inPeriod.filter((p) => p.direction === 'out').reduce((s, p) => s + p.amount, 0);
    endingBalance[key] = beginningBalance[key] + income[key] - expense[key];
  });

  return { beginningBalance, income, expense, endingBalance };
};

// ===== Category breakdown across all 3 periods (for detailed report drill-down) =====

interface CategoryPeriodDetail {
  cashReceived: number;
  expenseLines: { description: string; amount: number }[];
}

const getCategoryPeriodDetail = (
  payments: Payment[],
  category: CashFlowCategory,
  start: Date,
  end: Date,
): CategoryPeriodDetail => {
  const inCategory = payments.filter(
    (p) => p.category === category && parseISODate(p.date) >= start && parseISODate(p.date) <= end,
  );

  const cashReceived = inCategory
    .filter((p) => p.direction === 'in')
    .reduce((sum, p) => sum + p.amount, 0);

  const grouped = inCategory
    .filter((p) => p.direction === 'out')
    .reduce<Record<string, number>>((acc, p) => {
      const key = p.description ?? 'Other';
      acc[key] = (acc[key] ?? 0) + p.amount;
      return acc;
    }, {});

  const expenseLines = Object.entries(grouped).map(([description, amount]) => ({
    description,
    amount,
  }));

  return { cashReceived, expenseLines };
};

export interface CategoryBreakdown {
  cashReceived: PeriodValues;
  expenseLines: { description: string; values: PeriodValues }[];
}

export const getCategoryBreakdown = (
  payments: Payment[],
  category: CashFlowCategory,
  referenceDate: Date = new Date(),
): CategoryBreakdown => {
  const periods = getPeriodRanges(referenceDate);
  const periodKeys = ['lastMonth', 'monthToDate', 'yearToDate'] as const;

  const detailByPeriod = periodKeys.reduce(
    (acc, key) => {
      const { startDate, endDate } = periods[key];
      acc[key] = getCategoryPeriodDetail(payments, category, startDate, endDate);
      return acc;
    },
    {} as Record<(typeof periodKeys)[number], CategoryPeriodDetail>,
  );

  const cashReceived: PeriodValues = {
    lastMonth: detailByPeriod.lastMonth.cashReceived,
    monthToDate: detailByPeriod.monthToDate.cashReceived,
    yearToDate: detailByPeriod.yearToDate.cashReceived,
  };

  const descriptions = new Set<string>();
  periodKeys.forEach((key) =>
    detailByPeriod[key].expenseLines.forEach((line) => descriptions.add(line.description)),
  );

  const expenseLines = Array.from(descriptions).map((description) => ({
    description,
    values: {
      lastMonth:
        detailByPeriod.lastMonth.expenseLines.find((l) => l.description === description)
          ?.amount ?? 0,
      monthToDate:
        detailByPeriod.monthToDate.expenseLines.find((l) => l.description === description)
          ?.amount ?? 0,
      yearToDate:
        detailByPeriod.yearToDate.expenseLines.find((l) => l.description === description)
          ?.amount ?? 0,
    },
  }));

  return { cashReceived, expenseLines };
};