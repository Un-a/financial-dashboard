import { TransactionTable } from '../components/TransactionTable';
import { useTransactionStore } from '../stores/transactionStore';

export const TransactionsPage = () => {
  const accounts = useTransactionStore((state) => state.accounts);
  const payments = useTransactionStore((state) => state.payments);
  const invoices = useTransactionStore((state) => state.invoices);

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