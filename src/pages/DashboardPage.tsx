import { useTransactionStore } from '../stores/transactionStore';
import { CashFlowSummaryTable } from '../components/CashFlowSummaryTable';
import { CashFlowCard } from '../components/CashFlowCard';
import { TaxLimitSection } from '../components/TaxLimitSection';

export const DashboardPage = () => {
  const accounts = useTransactionStore((state) => state.accounts);
  const payments = useTransactionStore((state) => state.payments);

  return (
    <>
      <CashFlowCard accounts={accounts} />
      <div>
        <h1 className="mb-4 text-xl font-bold text-gray-900">Dashboard</h1>
        <CashFlowSummaryTable payments={payments} />
      </div>
      <div className="mt-6">
        <TaxLimitSection />
      </div>
    </>
  );
};