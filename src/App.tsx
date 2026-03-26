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
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction, TransactionType, Category, DEFAULT_CATEGORIES, Frequency } from './types';
import { storage } from './lib/storage';
import { cn, formatCurrency } from './lib/utils';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, isSameMonth, startOfDay, endOfDay, isAfter, isBefore } from 'date-fns';
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
  onDelete?: () => void;
  onEdit?: () => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, categories, onDelete, onEdit }) => {
  const category = categories.find(c => c.id === transaction.categoryId) || categories[categories.length - 1];
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group"
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
          style={{ backgroundColor: category?.color || '#6b7280' }}
        >
          <Wallet size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-slate-800">{transaction.description || category?.name}</p>
            {transaction.isRecurring && <Repeat size={12} className="text-blue-500" />}
          </div>
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
            {format(parseISO(transaction.date), 'MMM dd, yyyy')} • {category?.name}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <p className={cn(
          "text-sm font-bold",
          transaction.type === 'income' ? "text-emerald-600" : "text-slate-900"
        )}>
          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
        </p>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button onClick={onEdit} className="p-2 text-slate-300 hover:text-blue-500">
              <Edit2 size={16} />
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="p-2 text-slate-300 hover:text-red-500">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const SpendingChart = ({ transactions, categories }: { transactions: Transaction[], categories: Category[] }) => {
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
          formatter={(value: number) => formatCurrency(value)}
        />
      </PieChart>
    </ResponsiveContainer>
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
      lastGeneratedDate: initialData?.lastGeneratedDate
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
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
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

// --- Main App ---

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list' | 'settings'>('dashboard');
  const [isAdding, setIsAdding] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  // List Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string, end: string }>({ start: '', end: '' });
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const loadedTransactions = storage.getTransactions();
    const processed = storage.processRecurring(loadedTransactions);
    setTransactions(processed);
    setCategories(storage.getCategories());
  }, []);

  const handleAddTransaction = (t: Transaction) => {
    let updated: Transaction[];
    if (editingTransaction) {
      updated = transactions.map(item => item.id === t.id ? t : item);
    } else {
      updated = [t, ...transactions];
    }
    setTransactions(updated);
    storage.saveTransactions(updated);
    setIsAdding(false);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    storage.saveTransactions(updated);
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
    const monthTransactions = transactions.filter(t => isSameMonth(parseISO(t.date), now) && t.type === 'expense');
    
    return categories
      .filter(c => c.type === 'expense' && c.budget)
      .map(c => {
        const spent = monthTransactions
          .filter(t => t.categoryId === c.id)
          .reduce((acc, t) => acc + t.amount, 0);
        return {
          ...c,
          spent,
          percent: Math.min((spent / (c.budget || 1)) * 100, 100)
        };
      });
  }, [transactions, categories]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const cat = categories.find(c => c.id === t.categoryId);
        const matchesSearch = 
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat?.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesType = filterType === 'all' || t.type === filterType;
        const matchesCategory = filterCategory === 'all' || t.categoryId === filterCategory;
        
        let matchesDate = true;
        if (dateRange.start) matchesDate = matchesDate && !isBefore(parseISO(t.date), startOfDay(parseISO(dateRange.start)));
        if (dateRange.end) matchesDate = matchesDate && !isAfter(parseISO(t.date), endOfDay(parseISO(dateRange.end)));

        return matchesSearch && matchesType && matchesCategory && matchesDate;
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
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
              {formatCurrency(totals.totalBalance)}
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
                  <p className="text-xl font-bold text-emerald-900">{formatCurrency(totals.income)}</p>
                  <p className="text-[10px] text-emerald-600 mt-1">This Month</p>
                </Card>
                <Card className="bg-rose-50 border-rose-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-rose-500 rounded-lg text-white">
                      <TrendingDown size={16} />
                    </div>
                    <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Expenses</span>
                  </div>
                  <p className="text-xl font-bold text-rose-900">{formatCurrency(totals.expenses)}</p>
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
                            {formatCurrency(b.spent)} / {formatCurrency(b.budget || 0)}
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
                  <SpendingChart transactions={transactions} categories={categories} />
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
                    onDelete={() => handleDeleteTransaction(t.id)}
                    onEdit={() => {
                      setEditingTransaction(t);
                      setIsAdding(true);
                    }}
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
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

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
                    onDelete={() => handleDeleteTransaction(t.id)}
                    onEdit={() => {
                      setEditingTransaction(t);
                      setIsAdding(true);
                    }}
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
                            {category.icon}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{category.name}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                              {category.type} • Budget: {category.budget ? formatCurrency(category.budget) : 'None'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              const newName = prompt('Enter new category name:', category.name);
                              if (newName) {
                                const newBudget = prompt('Enter monthly budget (optional):', category.budget?.toString() || '');
                                const updated = categories.map(c => 
                                  c.id === category.id ? { ...c, name: newName, budget: newBudget ? parseFloat(newBudget) : undefined } : c
                                );
                                setCategories(updated);
                                storage.saveCategories(updated);
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${category.name}"? Transactions in this category will be moved to "Other".`)) {
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
                              }
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
                      const name = prompt('Category Name:');
                      if (!name) return;
                      const type = confirm('Is this an Income category? (Cancel for Expense)') ? 'income' : 'expense';
                      const budget = prompt('Monthly Budget (optional):');
                      const newCategory: Category = {
                        id: Math.random().toString(36).substr(2, 9),
                        name,
                        type,
                        icon: type === 'income' ? '💰' : '💸',
                        color: type === 'income' ? '#10b981' : '#ef4444',
                        budget: budget ? parseFloat(budget) : undefined
                      };
                      const updated = [...categories, newCategory];
                      setCategories(updated);
                      storage.saveCategories(updated);
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
                              alert('Data imported successfully!');
                            } catch (err) {
                              alert('Failed to import data. Invalid JSON format.');
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
                      if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                        setTransactions([]);
                        storage.saveTransactions([]);
                      }
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
    </div>
  );
}


