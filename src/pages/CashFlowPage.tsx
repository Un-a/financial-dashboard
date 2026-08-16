import { CashFlowTable } from '../components/CashFlowTable';

import { useTransactionStore } from '../stores/transactionStore';
export const CashFlowPage = () => {
  const payments = useTransactionStore((state) => state.payments);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900">Cash Flow</h1>
      <CashFlowTable payments={payments} />
    </div>
  );
};