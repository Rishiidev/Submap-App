import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currencyCode: string = 'USD') {
  const localeMap: Record<string, string> = {
    USD: 'en-US',
    EUR: 'de-DE',
    INR: 'en-IN',
    GBP: 'en-GB',
  };
  return new Intl.NumberFormat(localeMap[currencyCode] || 'en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
}
