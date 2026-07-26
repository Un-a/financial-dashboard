export type CurrencyCode = 'RSD' | 'EUR' | 'USD';

export interface ExchangeRate {
  date: string; // ISO date, exp. '2026-07-26'
  base: CurrencyCode;
  quote: CurrencyCode;
  rate: number;
  source: 'NBS'; // National Bank of Serbia
}

export interface Account {
  id: string;
  name: string;
  currency: CurrencyCode;
  type: 'bank' | 'cash';
  balance: number;
}

export interface Invoice {
  id: string;
  issueDate: string; // ISO date — date when invoice was issued
  dueDate?: string;
  amount: number;
  currency: CurrencyCode;
  clientName: string;
  isDomestic: boolean; // true = SEF (Serbian client), false = foreign client
}

export interface Payment {
  id: string;
  invoiceId?: string; //for foreign clients, payment can be made without invoice
  date: string; // ISO date
  amount: number;
  currency: CurrencyCode;
  accountId: string;
}

export type InvoiceStatus = 'unpaid' | 'partially_paid' | 'paid' | 'overdue';