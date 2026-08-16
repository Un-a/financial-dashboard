import { generateMockAccounts, generateMockExpenses, generateMockInvoicesAndPayments } from '../lib/mockData';
import { CashFlowSummaryTable } from '../components/CashFlowSummaryTable';
import { CashFlowCard } from '../components/CashFlowCard';

export const DashboardPage = () => {
  const accounts = generateMockAccounts();
  const { payments: incomePayments } = generateMockInvoicesAndPayments({ accounts });
  const expenses = generateMockExpenses(accounts, 15);
  const payments = [...incomePayments, ...expenses];

  return (
    <>
    <CashFlowCard accounts={accounts} />
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900">Dashboard</h1>
      <CashFlowSummaryTable payments={payments} />
    </div>
    </>
  );
};