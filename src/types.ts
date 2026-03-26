export type TransactionType = 'income' | 'expense';
export type Frequency = 'weekly' | 'monthly' | 'yearly';
export type Theme = 'light' | 'dark' | 'high-contrast';
export type CurrencyCode = 'USD' | 'EUR' | 'INR' | 'GBP';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  label: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
];

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string; // Use ID instead of name for better stability
  description: string;
  date: string; // ISO string
  isRecurring?: boolean;
  frequency?: Frequency;
  lastGeneratedDate?: string; // For recurring transactions
  parentId?: string; // If generated from a recurring transaction
  notes?: string;
  tags?: string[];
  recurringEditMode?: 'this' | 'future'; // Temporary field for modal
}

export const AVAILABLE_ICONS = [
  'Briefcase', 'Laptop', 'TrendingUp', 'Plus', 'Home', 'ShoppingCart', 'Zap', 
  'Film', 'Car', 'Heart', 'MoreHorizontal', 'Coffee', 'Utensils', 'Gift', 
  'Smartphone', 'Plane', 'Music', 'Book', 'Gamepad', 'Dumbbell', 'Scissors',
  'Camera', 'Brush', 'Globe', 'Shield', 'Key', 'Lock', 'User', 'Users', 'Mail'
];

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  budget?: number; // Monthly budget for expense categories
  rolloverEnabled?: boolean;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_1', name: 'Salary', icon: 'Briefcase', color: '#10b981', type: 'income' },
  { id: 'cat_2', name: 'Freelance', icon: 'Laptop', color: '#3b82f6', type: 'income' },
  { id: 'cat_3', name: 'Investment', icon: 'TrendingUp', color: '#8b5cf6', type: 'income' },
  { id: 'cat_4', name: 'Other Income', icon: 'Plus', color: '#6b7280', type: 'income' },
  { id: 'cat_5', name: 'Rent', icon: 'Home', color: '#ef4444', type: 'expense', budget: 1000 },
  { id: 'cat_6', name: 'Groceries', icon: 'ShoppingCart', color: '#f59e0b', type: 'expense', budget: 400 },
  { id: 'cat_7', name: 'Utilities', icon: 'Zap', color: '#06b6d4', type: 'expense', budget: 150 },
  { id: 'cat_8', name: 'Entertainment', icon: 'Film', color: '#ec4899', type: 'expense', budget: 100 },
  { id: 'cat_9', name: 'Transport', icon: 'Car', color: '#f97316', type: 'expense', budget: 200 },
  { id: 'cat_10', name: 'Health', icon: 'Heart', color: '#ef4444', type: 'expense', budget: 50 },
  { id: 'cat_11', name: 'Other Expense', icon: 'MoreHorizontal', color: '#6b7280', type: 'expense' },
];
