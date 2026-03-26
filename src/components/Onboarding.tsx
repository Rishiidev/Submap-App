import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Wallet, 
  TrendingUp, 
  PieChart, 
  Shield, 
  Globe, 
  Check,
  ArrowUpCircle,
  ArrowDownCircle,
  Sparkles,
  Smartphone,
  Share,
  PlusSquare,
  MoreVertical
} from 'lucide-react';
import { Currency, CURRENCIES, DEFAULT_CATEGORIES, Transaction } from '../types';
import { formatCurrency, cn } from '../lib/utils';

interface OnboardingProps {
  onComplete: (data: {
    currency: Currency;
    income: number;
    expense: number;
    incomeDescription: string;
    expenseDescription: string;
  }) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);
  const [income, setIncome] = useState<string>('');
  const [incomeDescription, setIncomeDescription] = useState<string>('Monthly Salary');
  const [expense, setExpense] = useState<string>('');
  const [expenseDescription, setExpenseDescription] = useState<string>('Monthly Rent');

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleComplete = () => {
    onComplete({
      currency,
      income: parseFloat(income) || 0,
      expense: parseFloat(expense) || 0,
      incomeDescription,
      expenseDescription
    });
  };

  const steps = [
    {
      title: "Welcome to SubMap",
      description: "Your personal finance companion for tracking subscriptions, expenses, and building wealth.",
      content: (
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 gap-4">
            <FeatureItem 
              icon={<TrendingUp className="text-emerald-500" />} 
              title="Smart Tracking" 
              desc="Automatically track recurring subscriptions and one-time expenses." 
            />
            <FeatureItem 
              icon={<PieChart className="text-blue-500" />} 
              title="Visual Insights" 
              desc="Understand your spending habits with beautiful, interactive charts." 
            />
            <FeatureItem 
              icon={<Shield className="text-purple-500" />} 
              title="Budget Control" 
              desc="Set monthly budgets for categories and get alerts before you overspend." 
            />
            <FeatureItem 
              icon={<Globe className="text-orange-500" />} 
              title="Multi-Currency" 
              desc="Manage your finances in any major currency with local formatting." 
            />
          </div>
        </div>
      )
    },
    {
      title: "Choose Your Currency",
      description: "Select the primary currency you'll use for your dashboard and reports.",
      content: (
        <div className="grid grid-cols-1 gap-3 py-4">
          {CURRENCIES.map(c => (
            <button
              key={c.code}
              onClick={() => setCurrency(c)}
              className={cn(
                "flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                currency.code === c.code 
                  ? "border-blue-600 bg-blue-50/50 shadow-md" 
                  : "border-slate-100 bg-white hover:border-slate-200"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold">
                  {c.symbol}
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800">{c.label}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">{c.code}</p>
                </div>
              </div>
              {currency.code === c.code && (
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <Check size={14} />
                </div>
              )}
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Install Submap",
      description: "Add Submap to your home screen for instant access — works like a native app.",
      content: (
        <div className="space-y-5 py-4">
          <div className="p-6 bg-blue-50 rounded-[32px] border border-blue-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600 mb-4">
              <Smartphone size={32} />
            </div>
            <h4 className="text-lg font-bold text-blue-900">Works Like an App</h4>
            <p className="text-sm text-blue-600/80 mt-1">Full screen, no browser bar, instant launch from your home screen.</p>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">iPhone / iPad</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                  <p className="text-sm text-slate-700">Tap the <span className="inline-flex items-center gap-1 font-bold"><Share size={14} /> Share</span> button in Safari</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                  <p className="text-sm text-slate-700">Scroll down and tap <span className="inline-flex items-center gap-1 font-bold"><PlusSquare size={14} /> Add to Home Screen</span></p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-xs font-bold">3</div>
                  <p className="text-sm text-slate-700">Tap <span className="font-bold">Add</span> — done!</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Android</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                  <p className="text-sm text-slate-700">Tap the <span className="inline-flex items-center gap-1 font-bold"><MoreVertical size={14} /> Menu</span> button in Chrome</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                  <p className="text-sm text-slate-700">Tap <span className="font-bold">"Add to Home screen"</span></p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-xs font-bold">3</div>
                  <p className="text-sm text-slate-700">Tap <span className="font-bold">Install</span> — enjoy!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Initial Income",
      description: "Let's start by adding your primary source of income or current balance.",
      content: (
        <div className="space-y-6 py-4">
          <div className="p-6 bg-emerald-50 rounded-[32px] border border-emerald-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-600 mb-4">
              <ArrowUpCircle size={32} />
            </div>
            <h4 className="text-lg font-bold text-emerald-900">Add Your Income</h4>
            <p className="text-sm text-emerald-600/80 mt-1">This helps us calculate your total balance.</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
              <input 
                type="text"
                value={incomeDescription}
                onChange={(e) => setIncomeDescription(e.target.value)}
                placeholder="e.g. Monthly Salary"
                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Amount ({currency.symbol})</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currency.symbol}</span>
                <input 
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-4 pl-10 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Common Expense",
      description: "Add a major monthly expense like rent or a subscription to see how SubMap works.",
      content: (
        <div className="space-y-6 py-4">
          <div className="p-6 bg-rose-50 rounded-[32px] border border-rose-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-rose-600 mb-4">
              <ArrowDownCircle size={32} />
            </div>
            <h4 className="text-lg font-bold text-rose-900">Add An Expense</h4>
            <p className="text-sm text-rose-600/80 mt-1">Track where your money goes every month.</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
              <input 
                type="text"
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
                placeholder="e.g. Monthly Rent"
                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Amount ({currency.symbol})</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currency.symbol}</span>
                <input 
                  type="number"
                  value={expense}
                  onChange={(e) => setExpense(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-4 pl-10 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col overflow-hidden">
      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-100">
        <motion.div 
          className="h-full bg-blue-600"
          initial={{ width: '0%' }}
          animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-12 flex flex-col items-center">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <motion.div
              key={`title-${step}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4"
            >
              <Sparkles size={12} />
              Step {step + 1} of {steps.length}
            </motion.div>
            <motion.h2 
              key={`h2-${step}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-black text-slate-900 tracking-tight leading-tight"
            >
              {currentStep.title}
            </motion.h2>
            <motion.p 
              key={`p-${step}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 text-sm leading-relaxed"
            >
              {currentStep.description}
            </motion.p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[300px]"
            >
              {currentStep.content}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-slate-100 bg-white/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={prevStep}
            disabled={step === 0}
            className={cn(
              "p-4 rounded-2xl font-bold flex items-center gap-2 transition-all",
              step === 0 ? "opacity-0 pointer-events-none" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <ChevronLeft size={20} />
            Back
          </button>

          {(step === 3 || step === 4) && (
            <button
              onClick={() => {
                if (step === 3) {
                  setIncome('');
                  nextStep();
                } else {
                  setExpense('');
                  handleComplete();
                }
              }}
              className="text-slate-400 hover:text-slate-600 font-bold text-sm px-4"
            >
              Skip
            </button>
          )}
        </div>

        <button
          onClick={step === steps.length - 1 ? handleComplete : nextStep}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-[0.98]"
        >
          {step === steps.length - 1 ? "Get Started" : "Continue"}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="text-sm font-bold text-slate-800">{title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{desc}</p>
    </div>
  </div>
);

export default Onboarding;
