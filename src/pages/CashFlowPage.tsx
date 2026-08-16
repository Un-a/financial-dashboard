// src/pages/CashFlowPage.tsx

import { generateMockAccounts, generateMockExpenses, generateMockInvoicesAndPayments } from '../lib/mockData';
import { CashFlowTable } from '../components/CashFlowTable';

export const CashFlowPage = () => {
  const accounts = generateMockAccounts();
  const { payments: incomePayments } = generateMockInvoicesAndPayments({ accounts });
  const expenses = generateMockExpenses(accounts, 15);
  const payments = [...incomePayments, ...expenses];

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900">Cash Flow</h1>
      <CashFlowTable payments={payments} />
    </div>
  );
};