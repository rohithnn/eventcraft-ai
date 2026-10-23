import { BudgetItem, CurrencyCode } from '../types/event';
import { CURRENCY_SYMBOLS } from '../constants/defaults';

export interface BudgetSummary {
  totalBudget: number;
  totalAllocated: number;
  totalSpent: number;
  remainingAllocated: number; // totalBudget - totalAllocated
  remainingCash: number; // totalBudget - totalSpent
  isOverAllocated: boolean;
  isOverSpent: boolean;
  percentAllocated: number;
  percentSpent: number;
}

/**
 * Calculates high-level totals and status indicators for an event budget
 */
export function calculateBudgetSummary(
  totalBudget: number,
  items: BudgetItem[]
): BudgetSummary {
  const safeTotalBudget = Math.max(0, totalBudget || 0);
  const totalAllocated = items.reduce((acc, item) => acc + (Number(item.allocatedAmount) || 0), 0);
  const totalSpent = items.reduce((acc, item) => acc + (Number(item.spentAmount) || 0), 0);

  const remainingAllocated = safeTotalBudget - totalAllocated;
  const remainingCash = safeTotalBudget - totalSpent;
  const isOverAllocated = totalAllocated > safeTotalBudget;
  const isOverSpent = totalSpent > safeTotalBudget;

  const percentAllocated = safeTotalBudget > 0 ? (totalAllocated / safeTotalBudget) * 100 : 0;
  const percentSpent = safeTotalBudget > 0 ? (totalSpent / safeTotalBudget) * 100 : 0;

  return {
    totalBudget: safeTotalBudget,
    totalAllocated,
    totalSpent,
    remainingAllocated,
    remainingCash,
    isOverAllocated,
    isOverSpent,
    percentAllocated,
    percentSpent,
  };
}

/**
 * Format a number as currency with symbol and localized thousands separator
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'INR',
  includeDecimals: boolean = false
): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '₹';
  const num = Number(amount) || 0;
  const locale = currency === 'INR' ? 'en-IN' : undefined;
  const formatted = num.toLocaleString(locale, {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  });
  return `${symbol}${formatted}`;
}

/**
 * Recalculate percentageOfBudget for each item based on current totalBudget
 */
export function recalculateBudgetPercentages(
  items: BudgetItem[],
  totalBudget: number
): BudgetItem[] {
  const safeTotal = Math.max(1, totalBudget);
  return items.map((item) => ({
    ...item,
    percentageOfBudget: Math.round(((Number(item.allocatedAmount) || 0) / safeTotal) * 100),
  }));
}

/**
 * Rebalances category allocations proportionately when total budget changes
 */
export function rebalanceBudgetAllocations(
  items: BudgetItem[],
  newTotalBudget: number
): BudgetItem[] {
  const currentTotal = items.reduce((acc, it) => acc + (Number(it.allocatedAmount) || 0), 0);
  if (currentTotal <= 0) {
    const perCategory = Math.floor(newTotalBudget / items.length);
    return items.map((it) => ({
      ...it,
      allocatedAmount: perCategory,
      percentageOfBudget: Math.round(100 / items.length),
    }));
  }

  const ratio = newTotalBudget / currentTotal;
  return items.map((it) => {
    const newAlloc = Math.round((Number(it.allocatedAmount) || 0) * ratio);
    return {
      ...it,
      allocatedAmount: newAlloc,
      percentageOfBudget: Math.round((newAlloc / newTotalBudget) * 100),
    };
  });
}
