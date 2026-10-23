import React, { useState } from 'react';
import { BudgetItem, CurrencyCode, BudgetCategory } from '../../types/event';
import { calculateBudgetSummary, formatCurrency, rebalanceBudgetAllocations } from '../../utils/budgetUtils';
import { DonutChart } from './DonutChart';
import { BudgetTable } from './BudgetTable';
import { AlertTriangle, TrendingDown, IndianRupee, PieChart, RefreshCw, CheckCircle2 } from 'lucide-react';

interface BudgetPlannerProps {
  items: BudgetItem[];
  totalBudget: number;
  currency: CurrencyCode;
  onUpdateItem: (id: string, updates: Partial<BudgetItem>) => void;
  onAddItem: (category: BudgetCategory, label: string, allocated: number) => void;
  onDeleteItem: (id: string) => void;
  onUpdateTotalBudget: (newTotal: number, rebalancedItems: BudgetItem[]) => void;
}

export function BudgetPlanner({
  items,
  totalBudget,
  currency,
  onUpdateItem,
  onAddItem,
  onDeleteItem,
  onUpdateTotalBudget,
}: BudgetPlannerProps) {
  const summary = calculateBudgetSummary(totalBudget, items);

  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [tempTotal, setTempTotal] = useState<number>(totalBudget);

  const handleSaveTotal = () => {
    const newBudget = Math.max(100, Number(tempTotal) || totalBudget);
    const rebalanced = rebalanceBudgetAllocations(items, newBudget);
    onUpdateTotalBudget(newBudget, rebalanced);
    setIsEditingTotal(false);
  };

  return (
    <div className="space-y-6">
      {/* High-Level Financial Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Target Budget */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Target</span>
            <IndianRupee className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {formatCurrency(summary.totalBudget, currency)}
            </span>
            <button
              onClick={() => {
                setTempTotal(summary.totalBudget);
                setIsEditingTotal(true);
              }}
              className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline"
            >
              Adjust
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Event ceiling target</p>
        </div>

        {/* Total Allocated */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Allocated</span>
            <PieChart className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-xl sm:text-2xl font-black ${summary.isOverAllocated ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
              {formatCurrency(summary.totalAllocated, currency)}
            </span>
            <span className={`text-xs font-bold ${summary.isOverAllocated ? 'text-rose-500' : 'text-slate-500'}`}>
              {Math.round(summary.percentAllocated)}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Sum across categories</p>
        </div>

        {/* Remaining to Allocate */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Allocation Buffer</span>
            <TrendingDown className={`w-4 h-4 ${summary.remainingAllocated < 0 ? 'text-rose-500' : 'text-emerald-500'}`} />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-xl sm:text-2xl font-black ${summary.remainingAllocated < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {formatCurrency(summary.remainingAllocated, currency)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {summary.remainingAllocated < 0 ? 'Over target allocation!' : 'Unallocated reserve'}
          </p>
        </div>

        {/* Actual Spent Cash */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Actual Spent</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {formatCurrency(summary.totalSpent, currency)}
            </span>
            <span className="text-xs font-bold text-slate-500">
              {Math.round(summary.percentSpent)}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {formatCurrency(summary.remainingCash, currency)} cash remaining
          </p>
        </div>
      </div>

      {/* Over-Budget Warning Banner */}
      {summary.isOverAllocated && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900 flex items-start gap-3.5 shadow-sm animate-in fade-in">
          <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
              Budget Warning: Allocated amount exceeds total target by{' '}
              {formatCurrency(summary.totalAllocated - summary.totalBudget, currency)}
            </h4>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
              Your categories sum to {formatCurrency(summary.totalAllocated, currency)}, which is over your target limit of {formatCurrency(summary.totalBudget, currency)}. Trim individual category lines or rebalance your budget.
            </p>
          </div>
          <button
            onClick={() => {
              const rebalanced = rebalanceBudgetAllocations(items, summary.totalAllocated);
              onUpdateTotalBudget(summary.totalAllocated, rebalanced);
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Fit Target to Allocations
          </button>
        </div>
      )}

      {/* Adjust Budget Modal / Inline Editor */}
      {isEditingTotal && (
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
              Adjust Total Target Budget:
            </span>
            <div className="relative">
              <input
                type="number"
                min="100"
                aria-label="Adjust Total Target Budget"
                value={tempTotal}
                onChange={(e) => setTempTotal(parseFloat(e.target.value) || 0)}
                className="w-36 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              (Will proportionately scale category allocations)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveTotal}
              className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-sm"
            >
              Rebalance & Save
            </button>
            <button
              onClick={() => setIsEditingTotal(false)}
              className="px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Two Column Layout: Donut Chart on Left, Detailed Table on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Donut Chart Card */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Allocation Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visual share per event category
              </p>
            </div>
          </div>
          <DonutChart items={items} totalBudget={totalBudget} currency={currency} />
        </div>

        {/* Detailed Table Card */}
        <div className="lg:col-span-7">
          <BudgetTable
            items={items}
            totalBudget={totalBudget}
            currency={currency}
            onUpdateItem={onUpdateItem}
            onAddItem={onAddItem}
            onDeleteItem={onDeleteItem}
          />
        </div>
      </div>
    </div>
  );
}
