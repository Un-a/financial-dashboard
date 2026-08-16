import { create } from 'zustand';
import type { Account, Invoice, Payment } from '../types';
import {
  generateMockAccounts,
  generateMockExpenses,
  generateMockInvoicesAndPayments,
} from '../lib/mockData';

interface TransactionStore {
  invoices: Invoice[];
  payments: Payment[];
  accounts: Account[];
  addInvoice: (invoice: Invoice) => void;
  addPayment: (payment: Payment) => void;
  addAccount: (account: Account) => void;
  setInvoices: (invoices: Invoice[]) => void;
  setPayments: (payments: Payment[]) => void;
  setAccounts: (accounts: Account[]) => void;
}

// Module-level seed — runs once when this module is first imported,
// so every page reads the exact same generated dataset.
const seedAccounts = generateMockAccounts();
const { invoices: seedInvoices, payments: seedIncomePayments } =
  generateMockInvoicesAndPayments({ accounts: seedAccounts });
const seedExpenses = generateMockExpenses(seedAccounts, 15);
const seedPayments = [...seedIncomePayments, ...seedExpenses];

export const useTransactionStore = create<TransactionStore>((set) => ({
  invoices: seedInvoices,
  payments: seedPayments,
  accounts: seedAccounts,

  addInvoice: (invoice) =>
    set((state) => ({ invoices: [...state.invoices, invoice] })),

  addPayment: (payment) =>
    set((state) => ({ payments: [...state.payments, payment] })),

  addAccount: (account) =>
    set((state) => ({ accounts: [...state.accounts, account] })),

  setInvoices: (invoices) => set({ invoices }),
  setPayments: (payments) => set({ payments }),
  setAccounts: (accounts) => set({ accounts }),
}));