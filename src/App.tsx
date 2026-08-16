import { generateMockAccounts, generateMockExpenses, generateMockInvoicesAndPayments } from './lib/mockData';
import { TransactionTable } from './components/TransactionTable';
import { CashFlowSummaryTable } from './components/CashFlowSummaryTable';
import { CashFlowTable } from './components/CashFlowTable';
import { CashFlowCard } from './components/CashFlowCard';

const App = () => {
  const accounts = generateMockAccounts();
  const { invoices, payments: incomePayments } = generateMockInvoicesAndPayments({ accounts });
  const expenses = generateMockExpenses(accounts, 15);
  const payments = [...incomePayments, ...expenses];

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      <CashFlowCard accounts={accounts} />
      <div>
        <h1 className="mb-3 text-xl font-bold text-gray-900">Dashboard (simplified)</h1>
        <CashFlowSummaryTable payments={payments} />
      </div>

      <div>
        <h1 className="mb-3 text-xl font-bold text-gray-900">Cash Flow page (detailed)</h1>
        <CashFlowTable payments={payments} />
      </div>

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
}

export default App;