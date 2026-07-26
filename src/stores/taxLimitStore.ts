import { create } from 'zustand';
import type { Invoice } from '../types';

const parseISODate = (isoDate: string): Date => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
};

interface TaxLimitStore {
  // NOTE: this is a naive sum across currencies — proper multi-currency
  // conversion to RSD (via CurrencyStore) is deferred to Phase 2.
  getPausalLimitUsage: (invoices: Invoice[], year: number) => number;

  // Sum of invoice amounts issued within the rolling 365 days
  // ending on asOfDate (inclusive).
  getVatLimitUsage: (invoices: Invoice[], asOfDate: string) => number;
}

export const useTaxLimitStore = create<TaxLimitStore>(() => ({
  getPausalLimitUsage: (invoices, year) => {
    return invoices
      .filter((invoice) => parseISODate(invoice.issueDate).getFullYear() === year)
      .reduce((sum, invoice) => sum + invoice.amount, 0);
  },

  getVatLimitUsage: (invoices, asOfDate) => {
    const endDate = parseISODate(asOfDate);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 365);

    return invoices
      .filter((invoice) => {
        const issueDate = parseISODate(invoice.issueDate);
        return issueDate >= startDate && issueDate <= endDate;
      })
      .reduce((sum, invoice) => sum + invoice.amount, 0);
  },
}));