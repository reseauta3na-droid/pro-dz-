import { InvoiceItem } from '../types';

export const DAYS_PER_WEEK = 6;

export function calculateInvoiceTotals(items: InvoiceItem[], taxRate: number = 0.005) {
  let totalDays = 0;
  let subTotal = 0;

  items.forEach(item => {
    const days = item.unit === 'week' ? item.quantity * DAYS_PER_WEEK : item.quantity;
    totalDays += days;
    subTotal += item.quantity * item.pricePerUnit;
  });

  const taxAmount = subTotal * taxRate;
  const total = subTotal + taxAmount; // User requested it to be added to the invoice

  return {
    totalDays,
    subTotal,
    taxAmount,
    total
  };
}

export function formatCurrency(amount: number) {
  if (isNaN(amount)) return '0 DA';
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
