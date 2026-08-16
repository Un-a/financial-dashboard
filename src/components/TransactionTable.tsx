import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import type { Account, Invoice, Payment, InvoiceStatus } from '../types';
import { getInvoiceStatus } from '../lib/invoiceStatus';

type TransactionTableProps =
  | {
      variant: 'invoices';
      invoices: Invoice[];
      payments: Payment[];
    }
  | {
      variant: 'payments';
      payments: Payment[];
      accounts: Account[];
      invoices?: Invoice[]; // to resolve human-readable invoice numbers
    };

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  paid: 'bg-green-100 text-green-700',
  partially_paid: 'bg-yellow-100 text-yellow-700',
  unpaid: 'bg-gray-100 text-gray-600',
  overdue: 'bg-red-100 text-red-700',
};

const StatusBadge = ({ status }: { status: InvoiceStatus }) => (
  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
    {status.replace('_', ' ')}
  </span>
);

const formatAmount = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
};


interface InvoiceRow extends Invoice {
  status: InvoiceStatus;
}

interface PaymentRow extends Payment {
  accountName: string;
  invoiceNumber?: string;
}

const invoiceColumnHelper = createColumnHelper<InvoiceRow>();
const paymentColumnHelper = createColumnHelper<PaymentRow>();

const invoiceColumns = [
  invoiceColumnHelper.accessor('invoiceNumber', {
    header: 'Invoice #',
  }),
  invoiceColumnHelper.accessor('clientName', {
    header: 'Client',
    cell: (info) => info.getValue(),
  }),
  invoiceColumnHelper.accessor('issueDate', {
    header: 'Issue date',
  }),
  invoiceColumnHelper.accessor('dueDate', {
    header: 'Due date',
    cell: (info) => info.getValue() ?? '—',
  }),
  invoiceColumnHelper.accessor('amount', {
    header: 'Amount',
    cell: (info) => formatAmount(info.getValue(), info.row.original.currency),
  }),
  invoiceColumnHelper.accessor('isDomestic', {
    header: 'Domestic',
    cell: (info) => (info.getValue() ? 'SEF' : 'Foreign'),
  }),
  invoiceColumnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
];

const paymentColumns = [
  paymentColumnHelper.accessor('date', { header: 'Date' }),
  paymentColumnHelper.accessor('direction', {
    header: 'Type',
    cell: (info) => (
      <span className={info.getValue() === 'in' ? 'text-green-700' : 'text-red-600'}>
        {info.getValue() === 'in' ? 'Income' : 'Expense'}
      </span>
    ),
  }),
  paymentColumnHelper.accessor('amount', {
    header: 'Amount',
    cell: (info) => {
      const sign = info.row.original.direction === 'out' ? '-' : '';
      return `${sign}${formatAmount(info.getValue(), info.row.original.currency)}`;
    },
  }),
  paymentColumnHelper.accessor('category', { header: 'Category' }),
  paymentColumnHelper.accessor('description', {
    header: 'Description',
    cell: (info) => info.getValue() ?? '—',
  }),
  paymentColumnHelper.accessor('accountName', { header: 'Account' }),
  paymentColumnHelper.accessor('invoiceNumber', {
    header: 'Linked invoice',
    cell: (info) => info.getValue() ?? '—',
  }),
];


const PAGE_SIZE = 10;

interface TableShellProps<T> {
  data: T[];
  columns: Parameters<typeof useReactTable<T>>[0]['columns'];
  filterPlaceholder: string;
}

const TableShell = <T extends object>({ data, columns, filterPlaceholder }: TableShellProps<T>) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: { pageSize: PAGE_SIZE },
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      <input
        type="text"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder={filterPlaceholder}
        className="mb-3 w-full max-w-xs rounded-md border border-gray-300 px-3 py-1.5 text-sm"
      />
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-200 text-gray-500">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer select-none py-2 font-medium"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: ' ▲',
                      desc: ' ▼',
                    }[header.column.getIsSorted() as string] ?? ''}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-gray-100">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {table.getRowModel().rows.length === 0 && (
        <p className="py-4 text-center text-sm text-gray-400">No results found.</p>
      )}

      {table.getPageCount() > 1 && (
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-md border border-gray-300 px-3 py-1 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded-md border border-gray-300 px-3 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export const TransactionTable = (props: TransactionTableProps) => {
  if (props.variant === 'invoices') {
    const { invoices, payments } = props;
    const data: InvoiceRow[] = invoices.map((invoice) => ({
      ...invoice,
      status: getInvoiceStatus(invoice, payments),
    }));

    return (
      <TableShell data={data} columns={invoiceColumns} filterPlaceholder="Search invoices..." />
    );
  }

  const { payments, accounts, invoices } = props;
  const data: PaymentRow[] = payments.map((payment) => ({
    ...payment,
    accountName: accounts.find((a) => a.id === payment.accountId)?.name ?? payment.accountId,
    invoiceNumber: invoices?.find((inv) => inv.id === payment.invoiceId)?.invoiceNumber,
  }));

  return (
    <TableShell data={data} columns={paymentColumns} filterPlaceholder="Search payments..." />
  );
};