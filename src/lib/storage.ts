import { Transaction, Category, DEFAULT_CATEGORIES, Frequency } from '../types';
import { addWeeks, addMonths, addYears, isBefore, parseISO, formatISO } from 'date-fns';

const STORAGE_KEY = 'submap_transactions';
const CATEGORIES_KEY = 'submap_categories';
const CURRENCY_KEY = 'submap_currency';

export const storage = {
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveTransactions: (transactions: Transaction[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  },
  getCategories: (): Category[] => {
    const data = localStorage.getItem(CATEGORIES_KEY);
    return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
  },
  saveCategories: (categories: Category[]) => {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  },
  getCurrency: (): string => {
    return localStorage.getItem(CURRENCY_KEY) || 'USD';
  },
  saveCurrency: (currency: string) => {
    localStorage.setItem(CURRENCY_KEY, currency);
  },
  getOnboardingStatus: (): boolean => {
    return localStorage.getItem('submap_onboarding_complete') === 'true';
  },
  setOnboardingStatus: (status: boolean) => {
    localStorage.setItem('submap_onboarding_complete', status ? 'true' : 'false');
  },
  
  processRecurring: (transactions: Transaction[]): Transaction[] => {
    const now = new Date();
    let newTransactions: Transaction[] = [];
    let updatedTransactions = [...transactions];
    let changed = false;

    updatedTransactions.forEach((t, index) => {
      if (t.isRecurring && t.frequency) {
        let lastDate = parseISO(t.lastGeneratedDate || t.date);
        let nextDate = lastDate;
        let itemChanged = false;

        const getNextDate = (date: Date, freq: Frequency) => {
          if (freq === 'weekly') return addWeeks(date, 1);
          if (freq === 'monthly') return addMonths(date, 1);
          if (freq === 'yearly') return addYears(date, 1);
          return date;
        };

        nextDate = getNextDate(lastDate, t.frequency);

        while (isBefore(nextDate, now)) {
          const newT: Transaction = {
            ...t,
            id: crypto.randomUUID(),
            date: formatISO(nextDate),
            isRecurring: false, // The generated one is not recurring itself
            parentId: t.id,
            lastGeneratedDate: undefined
          };
          newTransactions.push(newT);
          lastDate = nextDate;
          nextDate = getNextDate(lastDate, t.frequency);
          itemChanged = true;
          changed = true;
        }

        if (itemChanged) {
          updatedTransactions[index] = {
            ...t,
            lastGeneratedDate: formatISO(lastDate)
          };
        }
      }
    });

    if (newTransactions.length > 0) {
      const final = [...newTransactions, ...updatedTransactions];
      storage.saveTransactions(final);
      return final;
    }
    
    if (changed) {
      storage.saveTransactions(updatedTransactions);
      return updatedTransactions;
    }

    return transactions;
  }
};
