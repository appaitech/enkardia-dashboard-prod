
/**
 * Formats a number as currency
 */
export function formatCurrency(value: string | number, currency = 'USD'): string {
  if (typeof value === 'string') {
    value = parseFloat(value);
  }
  
  if (isNaN(value)) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Formats a date into a readable string
 */
export function formatDate(date: Date): string {
  return new Intl.NumberFormat('en-US', {
    dateStyle: 'medium'
  }).format(date);
}
