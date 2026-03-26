import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  LayoutDashboard, 
  List, 
  Settings as SettingsIcon,
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart as PieChartIcon,
  ChevronRight,
  Trash2,
  Download,
  Upload,
  X,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  Calendar,
  Repeat,
  Edit2,
  Check,
  AlertCircle,
  StickyNote,
  CheckSquare,
  Square,
  Palette,
  BarChart2,
  Tags,
  RefreshCw,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Transaction, 
  TransactionType, 
  Category, 
  DEFAULT_CATEGORIES, 
  Frequency,
  AVAILABLE_ICONS,
  Theme,
  Currency,
  CURRENCIES
} from './types';
import { storage } from './lib/storage';
import { cn, formatCurrency } from './lib/utils';
import Onboarding from './components/Onboarding';
import { 
  format, 
  parseISO, 
  startOfMonth, 
  endOfMonth, 
  isWithinInterval, 
  isSameMonth, 
  startOfDay, 
  endOfDay, 
  isAfter, 
  isBefore,
  subMonths,
  startOfYear,
  endOfYear,
  subYears
} from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

import * as Icons from 'lucide-react';

// --- Components ---

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={cn("bg-white rounded-2xl p-4 shadow-sm border border-slate-100", className)}>
    {children}
  </div>
);

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  title, 
  message, 
  confirmLabel = "Confirm", 
  cancelLabel = "Cancel", 
  onConfirm, 
  onCancel,
  variant = 'danger'
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
        onClick={onCancel}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-xs bg-white rounded-[32px] p-6 shadow-2xl text-center"
          onClick={e => e.stopPropagation()}
        >
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4",
            variant === 'danger' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
          )}>
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-sm text-slate-500 mb-6">{message}</p>
          <div className="flex flex-col gap-2">
            <button 
              onClick={onConfirm}
              className={cn(
                "w-full py-3 rounded-xl font-bold text-sm transition-all",
                variant === 'danger' ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
              )}
            >
              {confirmLabel}
            </button>
            <button 
              onClick={onCancel}
              className="w-full py-3 rounded-xl font-bold text-sm text-slate-400 hover:bg-slate-50 transition-all"
            >
              {cancelLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

interface IconButtonProps {
  icon: any;
  onClick: () => void;
  active?: boolean;
  label: string;
}

const IconButton = ({ icon: Icon, onClick, active, label }: IconButtonProps) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center gap-1 transition-colors",
      active ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
    )}
  >
    <Icon size={24} />
    <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
  </button>
);

interface TransactionItemProps {
  transaction: Transaction;
  categories: Category[];
  onDelete?: (t: Transaction) => void;
  onEdit?: () => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  isSelectionMode?: boolean;
  currency: Currency;
}

const IconRenderer = ({ iconName, size = 20, className }: { iconName: string, size?: number, className?: string }) => {
  const IconComponent = (Icons as any)[iconName];
  if (IconComponent) {
    return <IconComponent size={size} className={className} />;
  }
  return <span className={className}>{iconName}</span>;
};

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconName: string) => void;
  currentIcon: string;
}

const IconPickerModal: React.FC<IconPickerModalProps> = ({ isOpen, onClose, onSelect, currentIcon }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Select Icon</h3>
            <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 rounded-full">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-5 gap-3 max-h-[300px] overflow-y-auto p-1 scrollbar-hide">
            {AVAILABLE_ICONS.map(icon => (
              <button
                key={icon}
                onClick={() => {
                  onSelect(icon);
                  onClose();
                }}
                className={cn(
                  "aspect-square rounded-xl flex items-center justify-center transition-all",
                  currentIcon === icon ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                )}
              >
                <IconRenderer iconName={icon} size={20} />
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const TransactionItem: React.FC<TransactionItemProps> = ({ 
  transaction, 
  categories, 
  onDelete, 
  onEdit,
  isSelected,
  onSelect,
  isSelectionMode,
  currency
}) => {
  const category = categories.find(c => c.id === transaction.categoryId) || categories[categories.length - 1];
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "bg-white p-4 rounded-2xl border shadow-sm flex items-center justify-between group transition-all",
        isSelected ? "border-blue-500 bg-blue-50/30" : "border-slate-100",
        isSelectionMode && "cursor-pointer"
      )}
      onClick={() => isSelectionMode && onSelect?.(transaction.id)}
    >
      <div className="flex items-center gap-3">
        {isSelectionMode && (
          <div className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
            isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200 bg-white"
          )}>
            {isSelected && <Check size={12} />}
          </div>
        )}
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
          style={{ backgroundColor: category?.color || '#6b7280' }}
        >
          <IconRenderer iconName={category?.icon || 'Wallet'} size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-slate-800">{transaction.description || category?.name}</p>
            {transaction.isRecurring && <Repeat size={12} className="text-blue-500" />}
            {transaction.notes && <StickyNote size={12} className="text-slate-300" />}
          </div>
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
            {format(parseISO(transaction.date), 'MMM dd, yyyy')} • {category?.name}
          </p>
          {transaction.tags && transaction.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {transaction.tags.map(tag => (
                <span key={tag} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] font-bold uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {transaction.notes && (
            <p className="text-[10px] text-slate-400 italic mt-1 line-clamp-1 border-l-2 border-slate-100 pl-2">
              {transaction.notes}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <p className={cn(
          "text-sm font-bold",
          transaction.type === 'income' ? "text-emerald-600" : "text-slate-900"
        )}>
          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, currency.code)}
        </p>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button onClick={onEdit} className="p-2 text-slate-300 hover:text-blue-500">
              <Edit2 size={16} />
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(transaction)} className="p-2 text-slate-300 hover:text-red-500">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const SpendingChart = ({ transactions, categories, currency }: { transactions: Transaction[], categories: Category[], currency: Currency }) => {
  const data = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryMap: Record<string, { name: string, value: number, color: string }> = {};

    expenses.forEach(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      const catName = cat?.name || 'Other';
      if (!categoryMap[catName]) {
        categoryMap[catName] = { 
          name: catName, 
          value: 0, 
          color: cat?.color || '#6b7280' 
        };
      }
      categoryMap[catName].value += t.amount;
    });

    return Object.values(categoryMap).sort((a, b) => b.value - a.value);
  }, [transactions, categories]);

  if (data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-300">
        <PieChartIcon size={48} className="mb-2 opacity-20" />
        <p className="text-xs uppercase tracking-widest font-bold">No expense data</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          formatter={(value: number) => formatCurrency(value, currency.code)}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

const ReportsSection = ({ transactions, categories, currency }: { transactions: Transaction[], categories: Category[], currency: Currency }) => {
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const data = useMemo(() => {
    const now = new Date();
    if (period === 'monthly') {
      // Last 6 months
      return Array.from({ length: 6 }).map((_, i) => {
        const date = subMonths(now, 5 - i);
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        const monthTransactions = transactions.filter(t => 
          isWithinInterval(parseISO(t.date), { start: monthStart, end: monthEnd })
        );
        const income = monthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = monthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        return {
          name: format(date, 'MMM'),
          income,
          expense
        };
      });
    } else {
      // Last 3 years
      return Array.from({ length: 3 }).map((_, i) => {
        const date = subYears(now, 2 - i);
        const yearStart = startOfYear(date);
        const yearEnd = endOfYear(date);
        const yearTransactions = transactions.filter(t => 
          isWithinInterval(parseISO(t.date), { start: yearStart, end: yearEnd })
        );
        const income = yearTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = yearTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        return {
          name: format(date, 'yyyy'),
          income,
          expense
        };
      });
    }
  }, [transactions, period]);

  return (
    <div className="space-y-6">
      <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
        <button
          onClick={() => setPeriod('monthly')}
          className={cn(
            "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
            period === 'monthly' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
          )}
        >
          Monthly
        </button>
        <button
          onClick={() => setPeriod('yearly')}
          className={cn(
            "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
            period === 'yearly' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
          )}
        >
          Yearly
        </button>
      </div>

      <Card className="p-6 h-[300px]">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Income vs Expenses</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
              tickFormatter={(value) => `${currency.symbol}${value}`}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(value: number, name: string) => [formatCurrency(value, currency.code), name.charAt(0).toUpperCase() + name.slice(1)]}
            />
            <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

interface TransactionModalProps {
  onClose: () => void;
  onSubmit: (t: Transaction) => void;
  categories: Category[];
  initialData?: Transaction | null;
}

const TransactionModal = ({ onClose, onSubmit, categories, initialData }: TransactionModalProps) => {
  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || (categories.find(c => c.type === type)?.id || ''));
  const [date, setDate] = useState(initialData?.date || format(new Date(), 'yyyy-MM-dd'));
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring || false);
  const [frequency, setFrequency] = useState<Frequency>(initialData?.frequency || 'monthly');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');
  const [recurringEditMode, setRecurringEditMode] = useState<'this' | 'future'>('this');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return;

    const transaction: Transaction = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      amount: parseFloat(amount),
      description,
      type,
      categoryId,
      date,
      isRecurring,
      frequency: isRecurring ? frequency : undefined,
      parentId: initialData?.parentId,
      lastGeneratedDate: initialData?.lastGeneratedDate,
      notes: notes.trim() || undefined,
      tags: tags.split(',').map(t => t.trim()).filter(t => t !== ''),
      recurringEditMode: (initialData?.isRecurring || initialData?.parentId) ? recurringEditMode : undefined
    };

    onSubmit(transaction);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] p-8 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-slate-900">
            {initialData ? 'Edit Transaction' : 'New Transaction'}
          </h2>
          <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selector */}
          <div className="flex p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={cn(
                "flex-1 py-3 rounded-xl text-xs font-bold transition-all",
                type === 'expense' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
              )}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={cn(
                "flex-1 py-3 rounded-xl text-xs font-bold transition-all",
                type === 'income' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
              )}
            >
              Income
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input 
                  autoFocus
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-2xl font-bold focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Category</label>
              <select 
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="" disabled>Select Category</option>
                {categories.filter(c => c.type === type).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Description</label>
              <input 
                type="text" 
                placeholder="What was this for?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Tags (Comma separated)</label>
              <input 
                type="text" 
                placeholder="e.g. travel, food, work"
                value={tags}
                onChange={e => setTags(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Notes (Optional)</label>
              <textarea 
                placeholder="Add more details..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Date</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  onClick={() => setIsRecurring(!isRecurring)}
                  className={cn(
                    "flex items-center justify-center gap-2 py-4 rounded-2xl text-xs font-bold transition-all border",
                    isRecurring ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-slate-50 border-transparent text-slate-400"
                  )}
                >
                  <Repeat size={16} />
                  Recurring
                </button>
              </div>
            </div>

            {isRecurring && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-2"
              >
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Frequency</label>
                <div className="flex gap-2">
                  {(['weekly', 'monthly', 'yearly'] as Frequency[]).map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFrequency(f)}
                      className={cn(
                        "flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
                        frequency === f ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-400"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {(initialData?.isRecurring || initialData?.parentId) && (
              <div className="p-4 bg-blue-50 rounded-2xl space-y-3">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Recurring Transaction Edit</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRecurringEditMode('this')}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
                      recurringEditMode === 'this' ? "bg-blue-600 text-white shadow-sm" : "bg-white text-blue-400"
                    )}
                  >
                    Only this instance
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecurringEditMode('future')}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
                      recurringEditMode === 'future' ? "bg-blue-600 text-white shadow-sm" : "bg-white text-blue-400"
                    )}
                  >
                    This and future
                  </button>
                </div>
              </div>
            )}
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-[0.98]"
          >
            {initialData ? 'Update Transaction' : 'Save Transaction'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const CategoryModal = ({ 
  onClose, 
  onSubmit, 
  initialData 
}: { 
  onClose: () => void, 
  onSubmit: (c: Category) => void, 
  initialData?: Category | null 
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [icon, setIcon] = useState(initialData?.icon || (type === 'income' ? 'Briefcase' : 'ShoppingCart'));
  const [color, setColor] = useState(initialData?.color || (type === 'income' ? '#10b981' : '#ef4444'));
  const [budget, setBudget] = useState(initialData?.budget?.toString() || '');
  const [rolloverEnabled, setRolloverEnabled] = useState(initialData?.rolloverEnabled || false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  const colors = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', 
    '#06b6d4', '#f97316', '#6b7280', '#1e293b', '#4ade80', '#fb7185'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    onSubmit({
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      name,
      type,
      icon,
      color,
      budget: budget ? parseFloat(budget) : undefined,
      rolloverEnabled: type === 'expense' ? rolloverEnabled : false
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] p-8 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-slate-900">
            {initialData ? 'Edit Category' : 'New Category'}
          </h2>
          <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={cn(
                "flex-1 py-3 rounded-xl text-xs font-bold transition-all",
                type === 'expense' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
              )}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={cn(
                "flex-1 py-3 rounded-xl text-xs font-bold transition-all",
                type === 'income' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
              )}
            >
              Income
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setIsIconPickerOpen(true)}
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform active:scale-95"
                style={{ backgroundColor: color }}
              >
                <IconRenderer iconName={icon} size={32} />
              </button>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Name</label>
                <input 
                  type="text" 
                  placeholder="Category Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Color</label>
              <div className="flex flex-wrap gap-2">
                {colors.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "w-8 h-8 rounded-full transition-all",
                      color === c ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : "opacity-70 hover:opacity-100"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {type === 'expense' && (
              <>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Monthly Budget (Optional)</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Budget Rollover</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Carry over unspent budget</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRolloverEnabled(!rolloverEnabled)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative",
                      rolloverEnabled ? "bg-blue-600" : "bg-slate-300"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                      rolloverEnabled ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>
              </>
            )}
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-[0.98]"
          >
            {initialData ? 'Update Category' : 'Create Category'}
          </button>
        </form>

        {isIconPickerOpen && (
          <IconPickerModal 
            isOpen={isIconPickerOpen}
            currentIcon={icon}
            onSelect={(newIcon) => {
              setIcon(newIcon);
              setIsIconPickerOpen(false);
            }}
            onClose={() => setIsIconPickerOpen(false)}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list' | 'settings'>('dashboard');
  const [isAdding, setIsAdding] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [theme, setTheme] = useState<Theme>('light');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [listSubTab, setListSubTab] = useState<'history' | 'reports'>('history');
  const [iconPicker, setIconPicker] = useState<{
    isOpen: boolean;
    currentIcon: string;
    onSelect: (icon: string) => void;
  }>({
    isOpen: false,
    currentIcon: '',
    onSelect: () => {},
  });
  
  // List Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string, end: string }>({ start: '', end: '' });
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [predefinedRange, setPredefinedRange] = useState<'this-month' | 'last-month' | 'this-year' | 'all-time' | 'custom'>('this-month');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    const loadedTransactions = storage.getTransactions();
    const processed = storage.processRecurring(loadedTransactions);
    setTransactions(processed);
    setCategories(storage.getCategories());
    const savedCurrencyCode = storage.getCurrency();
    const selected = CURRENCIES.find(c => c.code === savedCurrencyCode) || CURRENCIES[0];
    setCurrency(selected);
    const savedTheme = localStorage.getItem('submap_theme') as Theme;
    if (savedTheme) setTheme(savedTheme);

    const onboardingComplete = storage.getOnboardingStatus();
    if (!onboardingComplete) {
      setShowOnboarding(true);
    }

    // Set initial date range to this month
    const now = new Date();
    setDateRange({
      start: format(startOfMonth(now), 'yyyy-MM-dd'),
      end: format(endOfMonth(now), 'yyyy-MM-dd')
    });
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'high-contrast');
    if (theme !== 'light') {
      document.documentElement.classList.add(theme);
    }
    localStorage.setItem('submap_theme', theme);
  }, [theme]);

  const handlePredefinedRange = (range: typeof predefinedRange) => {
    setPredefinedRange(range);
    const now = new Date();
    let start = '';
    let end = '';

    switch (range) {
      case 'this-month':
        start = format(startOfMonth(now), 'yyyy-MM-dd');
        end = format(endOfMonth(now), 'yyyy-MM-dd');
        break;
      case 'last-month':
        const lastMonth = subMonths(now, 1);
        start = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
        end = format(endOfMonth(lastMonth), 'yyyy-MM-dd');
        break;
      case 'this-year':
        start = format(startOfYear(now), 'yyyy-MM-dd');
        end = format(endOfYear(now), 'yyyy-MM-dd');
        break;
      case 'all-time':
        start = '';
        end = '';
        break;
      default:
        return;
    }
    setDateRange({ start, end });
  };

  const handleAddTransaction = (t: Transaction) => {
    let updated: Transaction[];
    if (editingTransaction) {
      if (t.recurringEditMode === 'future') {
        const parentId = t.isRecurring ? t.id : t.parentId;
        updated = transactions.map(item => {
          if (item.id === t.id) return t;
          if (parentId && (item.id === parentId || item.parentId === parentId)) {
            return { 
              ...t, 
              id: item.id, 
              date: item.date, 
              isRecurring: item.id === parentId, 
              parentId: item.id === parentId ? undefined : parentId,
              recurringEditMode: undefined 
            };
          }
          return item;
        });
      } else {
        updated = transactions.map(item => item.id === t.id ? t : item);
      }
    } else {
      updated = [t, ...transactions];
    }
    setTransactions(updated);
    storage.saveTransactions(updated);
    setIsAdding(false);
    setEditingTransaction(null);
  };

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    transactions.forEach(t => t.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [transactions]);

  const handleAddCategory = (cat: Category) => {
    let updated: Category[];
    if (editingCategory) {
      updated = categories.map(c => c.id === cat.id ? cat : c);
    } else {
      updated = [...categories, cat];
    }
    setCategories(updated);
    storage.saveCategories(updated);
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteTransaction = (t: Transaction) => {
    if (t.isRecurring || t.parentId) {
      setConfirmModal({
        isOpen: true,
        title: 'Delete Recurring Transaction',
        message: 'Do you want to delete only this instance or all future occurrences?',
        confirmLabel: 'This and future',
        cancelLabel: 'Only this',
        onConfirm: () => {
          const updated = transactions.filter(item => 
            item.id !== t.id && 
            item.parentId !== (t.isRecurring ? t.id : t.parentId) &&
            item.id !== (t.isRecurring ? t.id : t.parentId)
          );
          setTransactions(updated);
          storage.saveTransactions(updated);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        },
        onCancel: () => {
          const updated = transactions.filter(item => item.id !== t.id);
          setTransactions(updated);
          storage.saveTransactions(updated);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Delete Transaction',
      message: 'Are you sure you want to delete this transaction? This action cannot be undone.',
      onConfirm: () => {
        const updated = transactions.filter(item => item.id !== t.id);
        setTransactions(updated);
        storage.saveTransactions(updated);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      },
      onCancel: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
    });
  };

  const handleBulkDelete = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Bulk Delete',
      message: `Are you sure you want to delete ${selectedIds.length} transactions?`,
      onConfirm: () => {
        const updated = transactions.filter(t => !selectedIds.includes(t.id));
        setTransactions(updated);
        storage.saveTransactions(updated);
        setSelectedIds([]);
        setIsSelectionMode(false);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleBulkCategorize = (catId: string) => {
    const updated = transactions.map(t => 
      selectedIds.includes(t.id) ? { ...t, categoryId: catId } : t
    );
    setTransactions(updated);
    storage.saveTransactions(updated);
    setSelectedIds([]);
    setIsSelectionMode(false);
  };

  const handleBulkMarkRecurring = (freq: Frequency) => {
    const updated = transactions.map(t => 
      selectedIds.includes(t.id) ? { ...t, isRecurring: true, frequency: freq } : t
    );
    setTransactions(updated);
    storage.saveTransactions(updated);
    setSelectedIds([]);
    setIsSelectionMode(false);
  };

  const totals = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const currentMonth = transactions.filter(t => 
      isWithinInterval(parseISO(t.date), { start: monthStart, end: monthEnd })
    );

    const income = currentMonth.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expenses = currentMonth.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    
    return {
      income,
      expenses,
      balance: income - expenses,
      totalBalance: transactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0)
    };
  }, [transactions]);

  const budgetProgress = useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    return categories
      .filter(c => c.type === 'expense' && c.budget)
      .map(c => {
        const spent = transactions
          .filter(t => t.categoryId === c.id && isWithinInterval(parseISO(t.date), { start: currentMonthStart, end: currentMonthEnd }))
          .reduce((acc, t) => acc + t.amount, 0);
        
        let effectiveBudget = c.budget || 0;
        
        if (c.rolloverEnabled) {
          const lastMonthSpent = transactions
            .filter(t => t.categoryId === c.id && isWithinInterval(parseISO(t.date), { start: lastMonthStart, end: lastMonthEnd }))
            .reduce((acc, t) => acc + t.amount, 0);
          
          const rollover = Math.max(0, (c.budget || 0) - lastMonthSpent);
          effectiveBudget += rollover;
        }

        return {
          ...c,
          spent,
          effectiveBudget,
          percent: Math.min((spent / (effectiveBudget || 1)) * 100, 100)
        };
      });
  }, [transactions, categories]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const cat = categories.find(c => c.id === t.categoryId);
        const matchesSearch = 
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.notes?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          t.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesType = filterType === 'all' || t.type === filterType;
        const matchesCategory = filterCategory === 'all' || t.categoryId === filterCategory;
        const matchesTags = filterTags.length === 0 || filterTags.every(tag => t.tags?.includes(tag));
        
        let matchesDate = true;
        if (dateRange.start) matchesDate = matchesDate && !isBefore(parseISO(t.date), startOfDay(parseISO(dateRange.start)));
        if (dateRange.end) matchesDate = matchesDate && !isAfter(parseISO(t.date), endOfDay(parseISO(dateRange.end)));

        return matchesSearch && matchesType && matchesCategory && matchesDate && matchesTags;
      })
      .sort((a, b) => {
        let valA: any, valB: any;
        if (sortBy === 'date') {
          valA = parseISO(a.date).getTime();
          valB = parseISO(b.date).getTime();
        } else if (sortBy === 'amount') {
          valA = a.amount;
          valB = b.amount;
        } else {
          valA = categories.find(c => c.id === a.categoryId)?.name || '';
          valB = categories.find(c => c.id === b.categoryId)?.name || '';
        }
        
        if (sortOrder === 'asc') return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
      });
  }, [transactions, categories, searchQuery, filterType, filterCategory, dateRange, sortBy, sortOrder]);

  const handleOnboardingComplete = (data: {
    currency: Currency;
    income: number;
    expense: number;
    incomeDescription: string;
    expenseDescription: string;
  }) => {
    setCurrency(data.currency);
    storage.saveCurrency(data.currency.code);

    const newTransactions: Transaction[] = [];
    const now = new Date().toISOString();

    if (data.income > 0) {
      const incomeCat = categories.find(c => c.type === 'income') || DEFAULT_CATEGORIES[0];
      newTransactions.push({
        id: crypto.randomUUID(),
        type: 'income',
        amount: data.income,
        categoryId: incomeCat.id,
        description: data.incomeDescription,
        date: now
      });
    }

    if (data.expense > 0) {
      const expenseCat = categories.find(c => c.name === 'Rent') || categories.find(c => c.type === 'expense') || DEFAULT_CATEGORIES[4];
      newTransactions.push({
        id: crypto.randomUUID(),
        type: 'expense',
        amount: data.expense,
        categoryId: expenseCat.id,
        description: data.expenseDescription,
        date: now
      });
    }

    if (newTransactions.length > 0) {
      const updated = [...newTransactions, ...transactions];
      setTransactions(updated);
      storage.saveTransactions(updated);
    }

    storage.setOnboardingStatus(true);
    setShowOnboarding(false);
  };

  return (
    <div className={cn(
      "min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 pb-24",
      theme === 'dark' && "bg-slate-950 text-slate-50"
    )}>
      <AnimatePresence>
        {showOnboarding && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Submap</h1>
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Local Finance Tracker</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-medium uppercase">Total Balance</p>
            <p className={cn("font-bold", totals.totalBalance >= 0 ? "text-slate-900" : "text-red-500")}>
              {formatCurrency(totals.totalBalance, currency.code)}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-emerald-50 border-emerald-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-emerald-500 rounded-lg text-white">
                      <TrendingUp size={16} />
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Income</span>
                  </div>
                  <p className="text-xl font-bold text-emerald-900">{formatCurrency(totals.income, currency.code)}</p>
                  <p className="text-[10px] text-emerald-600 mt-1">This Month</p>
                </Card>
                <Card className="bg-rose-50 border-rose-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-rose-500 rounded-lg text-white">
                      <TrendingDown size={16} />
                    </div>
                    <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Expenses</span>
                  </div>
                  <p className="text-xl font-bold text-rose-900">{formatCurrency(totals.expenses, currency.code)}</p>
                  <p className="text-[10px] text-rose-600 mt-1">This Month</p>
                </Card>
              </div>

              {/* Budget Progress */}
              {budgetProgress.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Budget Progress</h3>
                  <div className="grid gap-3">
                    {budgetProgress.map(b => (
                      <Card key={b.id} className="p-3">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                            <span className="text-xs font-bold text-slate-700">{b.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">
                            {formatCurrency(b.spent, currency.code)} / {formatCurrency(b.effectiveBudget || 0, currency.code)}
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${b.percent}%` }}
                            className={cn(
                              "h-full rounded-full",
                              b.percent > 90 ? "bg-red-500" : b.percent > 75 ? "bg-amber-500" : "bg-blue-500"
                            )}
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Chart Section */}
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Spending Breakdown</h3>
                  <PieChartIcon size={18} className="text-slate-400" />
                </div>
                <div className="h-64 w-full">
                  <SpendingChart transactions={transactions} categories={categories} currency={currency} />
                </div>
              </Card>

              {/* Recent Transactions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Recent Activity</h3>
                  <button onClick={() => setActiveTab('list')} className="text-xs text-blue-600 font-semibold">View All</button>
                </div>
                {transactions.slice(0, 5).map(t => (
                  <TransactionItem 
                    key={t.id} 
                    transaction={t} 
                    categories={categories}
                    onDelete={() => handleDeleteTransaction(t)}
                    onEdit={() => {
                      setEditingTransaction(t);
                      setIsAdding(true);
                    }}
                    currency={currency}
                  />
                ))}
                {transactions.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                    <Wallet size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-slate-400 text-sm">No transactions yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'list' && (
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 pb-24"
            >
              <div className="flex p-1 bg-slate-100 rounded-2xl mb-4">
                <button
                  onClick={() => setListSubTab('history')}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                    listSubTab === 'history' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
                  )}
                >
                  <List size={14} />
                  History
                </button>
                <button
                  onClick={() => setListSubTab('reports')}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                    listSubTab === 'reports' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
                  )}
                >
                  <BarChart2 size={14} />
                  Reports
                </button>
              </div>

              {listSubTab === 'reports' ? (
                <ReportsSection transactions={transactions} categories={categories} currency={currency} />
              ) : (
                <>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="text"
                          placeholder="Search transactions..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                      <button 
                        onClick={() => {
                          setIsSelectionMode(!isSelectionMode);
                          setSelectedIds([]);
                        }}
                        className={cn(
                          "p-3 rounded-2xl border transition-all",
                          isSelectionMode ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-400"
                        )}
                      >
                        <CheckSquare size={20} />
                      </button>
                    </div>

                    {isSelectionMode && selectedIds.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-xl"
                      >
                        <span className="text-xs font-bold">{selectedIds.length} Selected</span>
                        <div className="flex items-center gap-2">
                          <select 
                            onChange={(e) => handleBulkCategorize(e.target.value)}
                            className="bg-slate-800 border-none text-[10px] font-bold rounded-lg px-2 py-1 focus:ring-0"
                            value=""
                          >
                            <option value="" disabled>Categorize</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                          <select 
                            onChange={(e) => handleBulkMarkRecurring(e.target.value as Frequency)}
                            className="bg-slate-800 border-none text-[10px] font-bold rounded-lg px-2 py-1 focus:ring-0"
                            value=""
                          >
                            <option value="" disabled>Recurring</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                          </select>
                          <button 
                            onClick={handleBulkDelete}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </motion.div>
                    )}

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {(['this-month', 'last-month', 'this-year', 'all-time', 'custom'] as const).map(range => (
                    <button 
                      key={range}
                      onClick={() => handlePredefinedRange(range)}
                      className={cn(
                        "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all",
                        predefinedRange === range ? "bg-blue-600 text-white" : "bg-white text-slate-400 border border-slate-200"
                      )}
                    >
                      {range.replace('-', ' ')}
                    </button>
                  ))}
                </div>

                {predefinedRange === 'custom' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Start</label>
                      <input 
                        type="date" 
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">End</label>
                      <input 
                        type="date" 
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <button 
                    onClick={() => setFilterType('all')}
                    className={cn(
                      "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                      filterType === 'all' ? "bg-slate-800 text-white" : "bg-white text-slate-600 border border-slate-200"
                    )}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setFilterType('income')}
                    className={cn(
                      "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                      filterType === 'income' ? "bg-green-600 text-white" : "bg-white text-slate-600 border border-slate-200"
                    )}
                  >
                    Income
                  </button>
                  <button 
                    onClick={() => setFilterType('expense')}
                    className={cn(
                      "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                      filterType === 'expense' ? "bg-red-600 text-white" : "bg-white text-slate-600 border border-slate-200"
                    )}
                  >
                    Expense
                  </button>
                  <div className="h-8 w-px bg-slate-200 mx-1" />
                  <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 rounded-full text-xs font-bold bg-white text-slate-600 border border-slate-200 focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {allTags.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <div className="flex items-center gap-2 mr-2">
                      <Tags size={14} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tags</span>
                    </div>
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          setFilterTags(prev => 
                            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                          );
                        }}
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all",
                          filterTags.includes(tag) ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter size={14} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sort By</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSortBy('date')}
                      className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded transition-all",
                        sortBy === 'date' ? "text-blue-600 bg-blue-50" : "text-slate-400"
                      )}
                    >
                      Date
                    </button>
                    <button 
                      onClick={() => setSortBy('amount')}
                      className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded transition-all",
                        sortBy === 'amount' ? "text-blue-600 bg-blue-50" : "text-slate-400"
                      )}
                    >
                      Amount
                    </button>
                    <button 
                      onClick={() => setSortBy('category')}
                      className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded transition-all",
                        sortBy === 'category' ? "text-blue-600 bg-blue-50" : "text-slate-400"
                      )}
                    >
                      Category
                    </button>
                    <button 
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="text-slate-400 p-1"
                    >
                      {sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {filteredTransactions.map(t => (
                  <TransactionItem 
                    key={t.id} 
                    transaction={t} 
                    categories={categories}
                    onDelete={() => handleDeleteTransaction(t)}
                    onEdit={() => {
                      setEditingTransaction(t);
                      setIsAdding(true);
                    }}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedIds.includes(t.id)}
                    onSelect={(id) => {
                      setSelectedIds(prev => 
                        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                      );
                    }}
                    currency={currency}
                  />
                ))}
                {filteredTransactions.length === 0 && (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search size={24} className="text-slate-300" />
                    </div>
                    <p className="text-slate-400 text-sm">No transactions found matching your criteria.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8 pb-24"
            >
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Preferences</h3>
                
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                        <Globe size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Base Currency</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Select your preferred currency</p>
                      </div>
                    </div>
                    <select 
                      value={currency.code}
                      onChange={(e) => {
                        const selected = CURRENCIES.find(c => c.code === e.target.value);
                        if (selected) {
                          setCurrency(selected);
                          storage.saveCurrency(selected.code);
                        }
                      }}
                      className="bg-slate-50 border-none rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                      ))}
                    </select>
                  </div>

                  <div className="h-px bg-slate-50" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Palette size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">App Theme</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Choose your visual style</p>
                      </div>
                    </div>
                    <div className="flex p-1 bg-slate-50 rounded-xl">
                      {(['light', 'dark', 'high-contrast'] as Theme[]).map(t => (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                            theme === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
                          )}
                        >
                          {t.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Categories</h3>
                <div className="grid gap-3">
                  {categories.map(category => (
                    <Card key={category.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                            style={{ backgroundColor: category.color }}
                          >
                            <IconRenderer iconName={category.icon} size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{category.name}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                              {category.type} • Budget: {category.budget ? formatCurrency(category.budget, currency.code) : 'None'}
                              {category.rolloverEnabled && ' • Rollover'}
                            </p>
                          </div>
                        </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setEditingCategory(category);
                                setIsCategoryModalOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => {
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Delete Category',
                                  message: `Are you sure you want to delete "${category.name}"? Transactions in this category will be moved to "Other".`,
                                  onConfirm: () => {
                                    const otherCategory = categories.find(c => c.name === 'Other' && c.type === category.type);
                                    if (otherCategory) {
                                      const updatedTransactions = transactions.map(t => 
                                        t.categoryId === category.id ? { ...t, categoryId: otherCategory.id } : t
                                      );
                                      setTransactions(updatedTransactions);
                                      storage.saveTransactions(updatedTransactions);
                                    }
                                    const updated = categories.filter(c => c.id !== category.id);
                                    setCategories(updated);
                                    storage.saveCategories(updated);
                                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                  }
                                });
                              }}
                              className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                      </div>
                    </Card>
                  ))}
                  <button 
                    onClick={() => {
                      setEditingCategory(null);
                      setIsCategoryModalOpen(true);
                    }}
                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm font-bold hover:border-blue-400 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    Add Custom Category
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Data Management</h3>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      const blob = new Blob([JSON.stringify({ transactions, categories })], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `submap-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
                      a.click();
                    }}
                    className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Download size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">Export Data</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Download JSON backup</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </button>

                  <label className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <Upload size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">Import Data</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Restore from JSON</p>
                      </div>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            try {
                              const data = JSON.parse(event.target?.result as string);
                              if (data.transactions) {
                                setTransactions(data.transactions);
                                storage.saveTransactions(data.transactions);
                              }
                              if (data.categories) {
                                setCategories(data.categories);
                                storage.saveCategories(data.categories);
                              }
                              setConfirmModal({
                                isOpen: true,
                                title: 'Import Successful',
                                message: 'Your data has been imported successfully!',
                                onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false })),
                                variant: 'info'
                              });
                            } catch (err) {
                              setConfirmModal({
                                isOpen: true,
                                title: 'Import Failed',
                                message: 'Failed to import data. Invalid JSON format.',
                                onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false })),
                                variant: 'danger'
                              });
                            }
                          };
                          reader.readAsText(file);
                        }
                      }}
                    />
                    <ChevronRight size={18} className="text-slate-300" />
                  </label>

                  <button 
                    onClick={() => {
                      setConfirmModal({
                        isOpen: true,
                        title: 'Clear All Data',
                        message: 'Are you sure you want to clear all data? This cannot be undone.',
                        onConfirm: () => {
                          setTransactions([]);
                          storage.saveTransactions([]);
                          setConfirmModal(prev => ({ ...prev, isOpen: false }));
                        }
                      });
                    }}
                    className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-red-600"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                        <Trash2 size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">Clear All Data</p>
                        <p className="text-[10px] text-red-400 uppercase tracking-wider">Wipe local storage</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-red-200" />
                  </button>

                  <button 
                    onClick={() => {
                      setConfirmModal({
                        isOpen: true,
                        title: 'Reset Onboarding',
                        message: 'This will reset your onboarding status and allow you to see the welcome screen again. Your data will not be deleted.',
                        onConfirm: () => {
                          storage.setOnboardingStatus(false);
                          window.location.reload();
                        }
                      });
                    }}
                    className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <RefreshCw size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">Reset Onboarding</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">See welcome screen again</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </button>
                </div>
              </div>

              <div className="p-6 text-center">
                <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">Submap v1.0.0</p>
                <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-widest">Built for privacy</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FAB */}
      <div className="fixed bottom-24 right-6 z-20">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAdding(true)}
          className="w-14 h-14 bg-slate-900 text-white rounded-full shadow-xl flex items-center justify-center"
        >
          <Plus size={28} />
        </motion.button>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 px-8 py-4 flex justify-between items-center z-10">
        <IconButton 
          icon={LayoutDashboard} 
          label="Home" 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
        />
        <IconButton 
          icon={List} 
          label="History" 
          active={activeTab === 'list'} 
          onClick={() => setActiveTab('list')} 
        />
        <IconButton 
          icon={SettingsIcon} 
          label="Settings" 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')} 
        />
      </nav>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {isAdding && (
          <TransactionModal 
            onClose={() => {
              setIsAdding(false);
              setEditingTransaction(null);
            }} 
            onSubmit={handleAddTransaction} 
            categories={categories}
            initialData={editingTransaction}
          />
        )}
      </AnimatePresence>

      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        variant={confirmModal.variant}
      />

      <IconPickerModal 
        isOpen={iconPicker.isOpen}
        currentIcon={iconPicker.currentIcon}
        onSelect={iconPicker.onSelect}
        onClose={() => setIconPicker(prev => ({ ...prev, isOpen: false }))}
      />

      <AnimatePresence>
        {isCategoryModalOpen && (
          <CategoryModal 
            onClose={() => {
              setIsCategoryModalOpen(false);
              setEditingCategory(null);
            }}
            onSubmit={handleAddCategory}
            initialData={editingCategory}
          />
        )}
      </AnimatePresence>
    </div>
  );
}


