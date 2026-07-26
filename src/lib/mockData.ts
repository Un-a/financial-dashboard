import { faker } from "@faker-js/faker";
import type { Account, Invoice, Payment } from "../types";

const toISODate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const generateMockAccounts = (): Account[] => {
  return [
    {
      id: "acc-rsd-bank",
      name: "Bank Account (RSD)",
      currency: "RSD",
      type: "bank",
      balance: faker.number.int({ min: 200_000, max: 800_000 }),
    },
    {
      id: "acc-eur-bank",
      name: "Bank Account (EUR)",
      currency: "EUR",
      type: "bank",
      balance: faker.number.int({ min: 2_000, max: 8_000 }),
    },
    {
      id: "acc-usd-bank",
      name: "Bank Account (USD)",
      currency: "USD",
      type: "bank",
      balance: faker.number.int({ min: 1_000, max: 5_000 }),
    },
    {
      id: "acc-cash-rsd",
      name: "Cash (RSD)",
      currency: "RSD",
      type: "cash",
      balance: faker.number.int({ min: 0, max: 30_000 }),
    },
  ];
};

// Manually curated client names (mix of Serbian and international companies).
const CLIENT_NAMES = [
  "Beograd Consulting d.o.o.",
  "Novi Sad IT Solutions",
  "Digitalna Agencija Niš",
  "Kraljevo Web Studio",
  "Nordic Web Studio",
  "Berlin Tech GmbH",
  "US Marketing Partners",
  "Vienna Creative House",
  "Amsterdam Design Co.",
];

// Seasonality multiplier by month (0 = January ... 11 = December).
const SEASONALITY: number[] = [
  0.7, 0.8, 1.1, 1.2, 1.1, 0.6, 0.5, 0.6, 1.2, 1.3, 1.1, 0.8,
];

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

  for (let monthOffset = monthsBack; monthOffset >= 0; monthOffset--) {
    const monthDate = new Date(
      today.getFullYear(),
      today.getMonth() - monthOffset,
      1,
    );
    const monthIndex = monthDate.getMonth();
    const seasonalityFactor = SEASONALITY[monthIndex];

    const invoiceCount = Math.max(
      1,
      Math.round(faker.number.int({ min: 3, max: 6 }) * seasonalityFactor),
    );

    for (let i = 0; i < invoiceCount; i++) {
      const isDomestic = faker.datatype.boolean({ probability: 0.4 }); // ~40% domestic (SEF)
      const currency = isDomestic
        ? "RSD"
        : faker.helpers.weightedArrayElement([
            { value: "EUR" as const, weight: 7 },
            { value: "USD" as const, weight: 3 },
          ]);

      const issueDate = faker.date.between({
        from: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1),
        to: new Date(monthDate.getFullYear(), monthDate.getMonth(), 27),
      });
      const dueDate = addDays(
        issueDate,
        faker.number.int({ min: 14, max: 30 }),
      );

      const amount =
        currency === "RSD"
          ? faker.number.int({ min: 50_000, max: 400_000 })
          : faker.number.float({ min: 500, max: 4_000, fractionDigits: 2 });

      const invoice: Invoice = {
        id: `inv-${faker.string.uuid()}`,
        issueDate: toISODate(issueDate),
        dueDate: toISODate(dueDate),
        amount,
        currency,
        clientName: faker.helpers.arrayElement(CLIENT_NAMES),
        isDomestic,
      };

      invoices.push(invoice);

      // Payment behavior: most invoices get paid, some partially, some stay unpaid/overdue
      const paymentRoll = Math.random();
      const matchingAccount = accounts.find((a) => a.currency === currency);

      // If there's no account in this currency, skip payment generation entirely —
      // the invoice stays 'unpaid'. With 4 accounts covering RSD/EUR/USD/cash,
      // this branch should not normally trigger, but it's kept as a safe guard.
      if (matchingAccount) {
        if (paymentRoll < 0.75) {
          // fully paid, sometime between issue and a bit after due date
          const paymentDate = addDays(
            issueDate,
            faker.number.int({ min: 5, max: 35 }),
          );
          payments.push({
            id: `pay-${faker.string.uuid()}`,
            invoiceId: invoice.id,
            date: toISODate(paymentDate),
            amount: invoice.amount,
            currency: invoice.currency,
            accountId: matchingAccount.id,
          });
        } else if (paymentRoll < 0.9) {
          // partially paid
          const paymentDate = addDays(
            issueDate,
            faker.number.int({ min: 5, max: 25 }),
          );
          const partialRatio = faker.number.float({
            min: 0.3,
            max: 0.7,
            fractionDigits: 2,
          });
          payments.push({
            id: `pay-${faker.string.uuid()}`,
            invoiceId: invoice.id,
            date: toISODate(paymentDate),
            amount: Number((invoice.amount * partialRatio).toFixed(2)),
            currency: invoice.currency,
            accountId: matchingAccount.id,
          });
        }
        // else: left unpaid (will show as 'unpaid' or 'overdue' via getInvoiceStatus)
      }
    }
  }

  // A few one-off cash payments without an invoiceId (e.g. small ad-hoc income)
  const cashAccount = accounts.find((a) => a.type === "cash") ?? accounts[0];
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
    });
  }

  return { invoices, payments };
};
