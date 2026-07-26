import { generateMockAccounts, generateMockInvoicesAndPayments } from './lib/mockData';
import { TransactionTable } from './components/TransactionTable';
import { CashFlowCard } from './components/CashFlowCard';

function App() {
  const accounts = generateMockAccounts();
  const { invoices, payments } = generateMockInvoicesAndPayments({ accounts });

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      <CashFlowCard accounts={accounts} />

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">Invoices</h2>
        <TransactionTable variant="invoices" invoices={invoices} payments={payments} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">Payments</h2>
        <TransactionTable variant="payments" payments={payments} accounts={accounts} />
      </div>
    </div>
  );
}

export default App;