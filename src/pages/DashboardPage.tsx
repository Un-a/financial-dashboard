import { useTransactionStore } from "../stores/transactionStore";
import { CashFlowSummaryTable } from "../components/cash-flow/CashFlowSummaryTable";
import { CashFlowCard } from "../components/cash-flow/CashFlowCard";
import { TaxLimitSection } from "../components/TaxLimitSection";

export const DashboardPage = () => {
  const accounts = useTransactionStore((state) => state.accounts);
  const payments = useTransactionStore((state) => state.payments);

  return (
    <>
      <div>
        <h1 className="mb-4 text-3xl font-bold text-center">Dashboard</h1>
        <CashFlowCard accounts={accounts} />
      </div>
      <CashFlowSummaryTable payments={payments} />
      <div className="mt-6">
        <TaxLimitSection />
      </div>
    </>
  );
};
