export type CurrencyCode = 'RSD' | 'EUR' | 'USD';

export interface ExchangeRate {
  date: string;
  base: CurrencyCode;
  quote: CurrencyCode;
  rate: number;
  source: 'NBS';
}

// ===== Accounts =====

export interface Account {
  id: string;
  name: string;
  currency: CurrencyCode;
  type: 'bank' | 'cash';
  balance: number;
}

// ===== Invoices =====

export interface Invoice {
  id: string;
  invoiceNumber: string; // human-readable number, e.g. 'INV-2026-014' — what's shown in UI
  issueDate: string;
  dueDate?: string;
  amount: number;
  currency: CurrencyCode;
  clientName: string;
  isDomestic: boolean;
}

// ===== Cash flow classification =====

// Standard cash flow statement categories.
export type CashFlowCategory = 'operating' | 'investing' | 'financing';

export type PaymentDirection = 'in' | 'out';

// ===== Payments =====

export interface Payment {
  id: string;
  invoiceId?: string; // optional — cash/one-off income without an invoice; never set for expenses
  date: string;
  amount: number; // always positive — direction determines in/out
  currency: CurrencyCode;
  accountId: string;
  direction: PaymentDirection;
  category: CashFlowCategory;
  description?: string; // e.g. 'Coworking rent' — shown in cash flow drill-down
}

// ===== Invoice status (computed, not stored) =====

export type InvoiceStatus = 'unpaid' | 'partially_paid' | 'paid' | 'overdue';