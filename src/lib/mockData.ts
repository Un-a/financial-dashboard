import { faker } from '@faker-js/faker';
import type { Account, CashFlowCategory, CurrencyCode, Invoice, Payment } from '../types';

// ===== Helpers =====

const toISODate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// ===== Accounts =====

export const generateMockAccounts = (): Account[] => {
  return [
    {
      id: 'acc-rsd-bank',
      name: 'Bank Account (RSD)',
      currency: 'RSD',
      type: 'bank',
      balance: faker.number.int({ min: 200_000, max: 800_000 }),
    },
    {
      id: 'acc-eur-bank',
      name: 'Bank Account (EUR)',
      currency: 'EUR',
      type: 'bank',
      balance: faker.number.int({ min: 2_000, max: 8_000 }),
    },
    {
      id: 'acc-usd-bank',
      name: 'Bank Account (USD)',
      currency: 'USD',
      type: 'bank',
      balance: faker.number.int({ min: 1_000, max: 5_000 }),
    },
    {
      id: 'acc-cash-rsd',
      name: 'Cash (RSD)',
      currency: 'RSD',
      type: 'cash',
      balance: faker.number.int({ min: 0, max: 30_000 }),
    },
  ];
};

// ===== Invoices & Payments (income) =====

const CLIENT_NAMES = [
  'Beograd Consulting d.o.o.',
  'Novi Sad IT Solutions',
  'Digitalna Agencija Niš',
  'Kraljevo Web Studio',
  'Nordic Web Studio',
  'Berlin Tech GmbH',
  'US Marketing Partners',
  'Vienna Creative House',
  'Amsterdam Design Co.',
];

// Seasonality multiplier by month (0 = January ... 11 = December).
const SEASONALITY: number[] = [0.7, 0.8, 1.1, 1.2, 1.1, 0.6, 0.5, 0.6, 1.2, 1.3, 1.1, 0.8];

interface MockDataOptions {
  monthsBack?: number;
  accounts: Account[];
}

export const generateMockInvoicesAndPayments = (
  options: MockDataOptions,
): { invoices: Invoice[]; payments: Payment[] } => {
  const { monthsBack = 15, accounts } = options;

  const invoices: Invoice[] = [];
  const payments: Payment[] = [];
  const today = new Date();
  const invoiceNumberCounters: Record<number, number> = {};

const generateInvoiceNumber = (issueDate: Date): string => {
  const year = issueDate.getFullYear();
  invoiceNumberCounters[year] = (invoiceNumberCounters[year] ?? 0) + 1;
  const seq = String(invoiceNumberCounters[year]).padStart(3, '0');
  return `INV-${year}-${seq}`;
};

  for (let monthOffset = monthsBack; monthOffset >= 0; monthOffset--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
    const monthIndex = monthDate.getMonth();
    const seasonalityFactor = SEASONALITY[monthIndex];

    const invoiceCount = Math.round(
      faker.number.int({ min: 3, max: 6 }) * seasonalityFactor,
    );

    for (let i = 0; i < invoiceCount; i++) {
      const isDomestic = faker.datatype.boolean({ probability: 0.4 });
      const currency = isDomestic
        ? 'RSD'
        : faker.helpers.weightedArrayElement([
            { value: 'EUR' as const, weight: 7 },
            { value: 'USD' as const, weight: 3 },
          ]);

      const issueDate = faker.date.between({
        from: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1),
        to: new Date(monthDate.getFullYear(), monthDate.getMonth(), 27),
      });
      const dueDate = addDays(issueDate, faker.number.int({ min: 14, max: 30 }));

      const amount =
        currency === 'RSD'
          ? faker.number.int({ min: 50_000, max: 400_000 })
          : faker.number.float({ min: 500, max: 4_000, fractionDigits: 2 });

      const invoice: Invoice = {
        id: `inv-${faker.string.uuid()}`,
        invoiceNumber: generateInvoiceNumber(issueDate),
        issueDate: toISODate(issueDate),
        dueDate: toISODate(dueDate),
        amount,
        currency,
        clientName: faker.helpers.arrayElement(CLIENT_NAMES),
        isDomestic,
      };

      invoices.push(invoice);

      const paymentRoll = Math.random();
      const matchingAccount = accounts.find((a) => a.currency === currency);

      if (matchingAccount) {
        if (paymentRoll < 0.75) {
          const paymentDate = addDays(issueDate, faker.number.int({ min: 5, max: 35 }));
          payments.push({
            id: `pay-${faker.string.uuid()}`,
            invoiceId: invoice.id,
            date: toISODate(paymentDate),
            amount: invoice.amount,
            currency: invoice.currency,
            accountId: matchingAccount.id,
            direction: 'in',
            category: 'operating',
          });
        } else if (paymentRoll < 0.9) {
          const paymentDate = addDays(issueDate, faker.number.int({ min: 5, max: 25 }));
          const partialRatio = faker.number.float({ min: 0.3, max: 0.7, fractionDigits: 2 });
          payments.push({
            id: `pay-${faker.string.uuid()}`,
            invoiceId: invoice.id,
            date: toISODate(paymentDate),
            amount: Number((invoice.amount * partialRatio).toFixed(2)),
            currency: invoice.currency,
            accountId: matchingAccount.id,
            direction: 'in',
            category: 'operating',
          });
        }
        // else: left unpaid
      }
    }
  }

  // A few one-off cash payments without an invoiceId
  const cashAccount = accounts.find((a) => a.type === 'cash') ?? accounts[0];
  for (let i = 0; i < 5; i++) {
    const monthOffset = faker.number.int({ min: 0, max: monthsBack });
    const date = faker.date.between({
      from: new Date(today.getFullYear(), today.getMonth() - monthOffset, 1),
      to: new Date(today.getFullYear(), today.getMonth() - monthOffset, 27),
    });

    payments.push({
      id: `pay-${faker.string.uuid()}`,
      date: toISODate(date),
      amount: faker.number.int({ min: 1_000, max: 20_000 }),
      currency: cashAccount.currency,
      accountId: cashAccount.id,
      direction: 'in',
      category: 'operating',
      description: 'Ad-hoc cash income',
    });
  }

  return { invoices, payments };
};

// ===== Expenses (outflow) =====

interface ExpenseTemplate {
  description: string;
  category: CashFlowCategory;
  currency: CurrencyCode;
  min: number;
  max: number;
  frequency: 'monthly' | 'occasional';
  probability?: number; // used only when frequency === 'occasional'
}

const EXPENSE_TEMPLATES: ExpenseTemplate[] = [
  { description: 'Coworking / office rent', category: 'operating', currency: 'RSD', min: 20_000, max: 45_000, frequency: 'monthly' },
  { description: 'Phone & internet', category: 'operating', currency: 'RSD', min: 2_500, max: 4_500, frequency: 'monthly' },
  { description: 'Software subscriptions', category: 'operating', currency: 'USD', min: 30, max: 120, frequency: 'monthly' },
  { description: 'Contractor payment', category: 'operating', currency: 'RSD', min: 40_000, max: 150_000, frequency: 'occasional', probability: 0.5 },
  { description: 'Equipment purchase', category: 'investing', currency: 'RSD', min: 60_000, max: 250_000, frequency: 'occasional', probability: 0.15 },
  { description: 'Loan repayment', category: 'financing', currency: 'RSD', min: 15_000, max: 30_000, frequency: 'occasional', probability: 0.3 },
];

export const generateMockExpenses = (accounts: Account[], monthsBack = 15): Payment[] => {
  const expenses: Payment[] = [];
  const today = new Date();

  for (let monthOffset = monthsBack; monthOffset >= 0; monthOffset--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);

    EXPENSE_TEMPLATES.forEach((template) => {
      const shouldGenerate =
        template.frequency === 'monthly'
          ? Math.random() < 0.9 // recurring costs occasionally skipped too
          : Math.random() < (template.probability ?? 0.3);

      if (!shouldGenerate) return;

      const account = accounts.find((a) => a.currency === template.currency);
      if (!account) return; // no account in this currency — skip, same rule as income

      const day = faker.number.int({ min: 1, max: 27 });
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      const amount =
        template.currency === 'RSD'
          ? faker.number.int({ min: template.min, max: template.max })
          : faker.number.float({ min: template.min, max: template.max, fractionDigits: 2 });

      expenses.push({
        id: `pay-${faker.string.uuid()}`,
        date: toISODate(date),
        amount,
        currency: template.currency,
        accountId: account.id,
        direction: 'out',
        category: template.category,
        description: template.description,
      });
    });
  }

  return expenses;
};