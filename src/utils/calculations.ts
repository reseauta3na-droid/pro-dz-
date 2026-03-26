import { InvoiceItem, Currency } from '../types';

export const DAYS_PER_WEEK = 6;

export function calculateInvoiceTotals(items: InvoiceItem[], taxRate: number = 0, tvaRate: number = 0) {
  let totalDays = 0;
  let subTotal = 0;

  items.forEach(item => {
    if (item.unit === 'week') {
      totalDays += item.quantity * DAYS_PER_WEEK;
    } else if (item.unit === 'day') {
      totalDays += item.quantity;
    }
    // For 'forfait', we don't add to totalDays as they are not time-based
    subTotal += item.quantity * item.pricePerUnit;
  });

  const taxAmount = subTotal * taxRate;
  const tvaAmount = subTotal * tvaRate;
  const total = subTotal + taxAmount + tvaAmount;

  return {
    totalDays,
    subTotal,
    taxAmount,
    tvaAmount,
    total
  };
}

export function formatCurrency(amount: number, currency: Currency = 'DZD') {
  if (isNaN(amount)) return `0 ${currency === 'DZD' ? 'DA' : currency}`;
  
  const rounded = Math.round(amount);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
  if (currency === 'DZD') return `${formatted} DA`;
  if (currency === 'EUR') return `${formatted} €`;
  if (currency === 'USD') return `$${formatted}`;
  
  return `${formatted} ${currency}`;
}
