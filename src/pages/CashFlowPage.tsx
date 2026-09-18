import { CashFlowTable } from '../components/cash-flow/CashFlowTable';

import { useTransactionStore } from '../stores/transactionStore';
export const CashFlowPage = () => {
  const payments = useTransactionStore((state) => state.payments);

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold text-center">Cash Flow</h1>
      <CashFlowTable payments={payments} />
    </div>
  );
};