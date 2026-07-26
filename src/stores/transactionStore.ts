import { create } from 'zustand';
import type { Account, Invoice, Payment } from '../types';

interface TransactionStore {
  invoices: Invoice[];
  payments: Payment[];
  accounts: Account[];
  addInvoice: (invoice: Invoice) => void;
  addPayment: (payment: Payment) => void;
  addAccount: (account: Account) => void;
  // Bulk setters — useful for loading mock data on app init
  setInvoices: (invoices: Invoice[]) => void;
  setPayments: (payments: Payment[]) => void;
  setAccounts: (accounts: Account[]) => void;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  invoices: [],
  payments: [],
  accounts: [],

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