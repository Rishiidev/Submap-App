export type TransactionType = 'income' | 'expense';
export type Frequency = 'weekly' | 'monthly' | 'yearly';

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
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  budget?: number; // Monthly budget for expense categories
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
