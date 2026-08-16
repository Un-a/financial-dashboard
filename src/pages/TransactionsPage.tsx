// src/pages/TransactionsPage.tsx

import { generateMockAccounts, generateMockExpenses, generateMockInvoicesAndPayments } from '../lib/mockData';
import { TransactionTable } from '../components/TransactionTable';

export const TransactionsPage = () => {
  const accounts = generateMockAccounts();
  const { invoices, payments: incomePayments } = generateMockInvoicesAndPayments({ accounts });
  const expenses = generateMockExpenses(accounts, 15);
  const payments = [...incomePayments, ...expenses];

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-gray-900">Transactions</h1>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">Invoices</h2>
        <TransactionTable variant="invoices" invoices={invoices} payments={payments} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">Payments</h2>
        <TransactionTable variant="payments" payments={payments} accounts={accounts} invoices={invoices} />
      </div>
    </div>
  );
};