import { describe, it, expect } from 'vitest';
import { calculateBudgetSummary, formatCurrency, recalculateBudgetPercentages, rebalanceBudgetAllocations } from '../utils/budgetUtils';
import { BudgetItem } from '../types/event';

const mockBudgetItems: BudgetItem[] = [
  { id: '1', category: 'venue', categoryLabel: 'Venue', allocatedAmount: 5000, spentAmount: 4800, percentageOfBudget: 50 },
  { id: '2', category: 'catering', categoryLabel: 'Catering', allocatedAmount: 3000, spentAmount: 3200, percentageOfBudget: 30 },
  { id: '3', category: 'decor', categoryLabel: 'Decor', allocatedAmount: 2000, spentAmount: 1800, percentageOfBudget: 20 },
];

describe('budgetUtils', () => {
  it('correctly calculates total allocated, total spent, and remaining amounts', () => {
    const summary = calculateBudgetSummary(10000, mockBudgetItems);
    expect(summary.totalBudget).toBe(10000);
    expect(summary.totalAllocated).toBe(10000);
    expect(summary.totalSpent).toBe(9800);
    expect(summary.remainingAllocated).toBe(0);
    expect(summary.remainingCash).toBe(200);
    expect(summary.isOverAllocated).toBe(false);
    expect(summary.isOverSpent).toBe(false);
    expect(summary.percentAllocated).toBe(100);
  });

  it('detects over-allocated budget correctly', () => {
    const summary = calculateBudgetSummary(8000, mockBudgetItems);
    expect(summary.isOverAllocated).toBe(true);
    expect(summary.remainingAllocated).toBe(-2000);
  });

  it('detects over-spent cash budget correctly', () => {
    const overspentItems: BudgetItem[] = [
      { id: '1', category: 'venue', categoryLabel: 'Venue', allocatedAmount: 5000, spentAmount: 6000, percentageOfBudget: 50 },
      { id: '2', category: 'catering', categoryLabel: 'Catering', allocatedAmount: 5000, spentAmount: 5500, percentageOfBudget: 50 },
    ];
    const summary = calculateBudgetSummary(10000, overspentItems);
    expect(summary.isOverSpent).toBe(true);
    expect(summary.remainingCash).toBe(-1500);
  });

  it('formats currency with symbol and localized commas', () => {
    expect(formatCurrency(12500, 'USD')).toBe('$12,500');
    expect(formatCurrency(8500, 'EUR')).toBe('€8,500');
    expect(formatCurrency(50000, 'INR')).toBe('₹50,000');
    expect(formatCurrency(2500000, 'INR')).toBe('₹25,00,000');
    expect(formatCurrency(1500.5, 'USD', true)).toBe('$1,500.50');
  });

  it('recalculates percentages proportionately when total changes', () => {
    const recalculated = recalculateBudgetPercentages(mockBudgetItems, 20000);
    expect(recalculated[0].percentageOfBudget).toBe(25); // 5000 / 20000
    expect(recalculated[1].percentageOfBudget).toBe(15); // 3000 / 20000
    expect(recalculated[2].percentageOfBudget).toBe(10); // 2000 / 20000
  });

  it('proportionately scales allocations when rebalancing budget', () => {
    const rebalanced = rebalanceBudgetAllocations(mockBudgetItems, 20000);
    expect(rebalanced[0].allocatedAmount).toBe(10000);
    expect(rebalanced[1].allocatedAmount).toBe(6000);
    expect(rebalanced[2].allocatedAmount).toBe(4000);
  });

  it('handles rebalancing edge cases gracefully (empty list, zero budget, zero allocations)', () => {
    expect(rebalanceBudgetAllocations([], 10000)).toEqual([]);

    const zeroBudget = rebalanceBudgetAllocations(mockBudgetItems, 0);
    expect(zeroBudget.every((item) => item.allocatedAmount === 0)).toBe(true);

    const zeroAllocItems: BudgetItem[] = [
      { id: '1', category: 'venue', categoryLabel: 'Venue', allocatedAmount: 0, spentAmount: 0, percentageOfBudget: 0 },
      { id: '2', category: 'catering', categoryLabel: 'Catering', allocatedAmount: 0, spentAmount: 0, percentageOfBudget: 0 },
    ];
    const evenlyDistributed = rebalanceBudgetAllocations(zeroAllocItems, 10000);
    expect(evenlyDistributed[0].allocatedAmount).toBe(5000);
    expect(evenlyDistributed[1].allocatedAmount).toBe(5000);
  });
});
