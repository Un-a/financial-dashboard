import type { Invoice, Payment, InvoiceStatus } from '../types';

export const getInvoiceStatus = (invoice: Invoice, payments: Payment[]): InvoiceStatus => {
  const linked = payments.filter((payment) => payment.invoiceId === invoice.id);
  const totalPaid = linked.reduce((sum, payment) => sum + payment.amount, 0);

  if (totalPaid >= invoice.amount) return 'paid';
  if (totalPaid > 0) return 'partially_paid';
  if (invoice.dueDate && new Date(invoice.dueDate) < new Date()) return 'overdue';

  return 'unpaid';
}