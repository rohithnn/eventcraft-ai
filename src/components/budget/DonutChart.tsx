import React, { useState } from 'react';
import { BudgetItem, CurrencyCode } from '../../types/event';
import { BUDGET_CATEGORIES } from '../../constants/defaults';
import { formatCurrency } from '../../utils/budgetUtils';

interface DonutChartProps {
  items: BudgetItem[];
  totalBudget: number;
  currency: CurrencyCode;
}

export function DonutChart({ items, totalBudget, currency }: DonutChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const totalAllocated = items.reduce((acc, it) => acc + (it.allocatedAmount || 0), 0);
  const safeTotal = Math.max(1, totalAllocated);

  const size = 260;
  const strokeWidth = 36;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Compute SVG slice offsets
  let cumulativePercent = 0;
  const slices = items.map((item, idx) => {
    const meta = BUDGET_CATEGORIES.find((c) => c.key === item.category);
    const color = meta?.color || '#94a3b8';
    const percent = item.allocatedAmount > 0 ? (item.allocatedAmount / safeTotal) * 100 : 0;
    const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativePercent / 100) * circumference);
    cumulativePercent += percent;

    return {
      item,
      color,
      percent,
      strokeDasharray,
      strokeDashoffset,
      idx,
    };
  });

  const activeSlice = hoveredIdx !== null ? slices[hoveredIdx] : null;

  return (
    <div className="flex flex-col items-center">
      {/* SVG Donut Chart */}
      <div className="relative w-[260px] h-[260px]">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
          role="img"
          aria-label={`Donut chart representing budget distribution of ${formatCurrency(totalBudget, currency)}`}
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-800"
          />

          {slices.map((slice) => (
            <circle
              key={slice.item.id}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={hoveredIdx === slice.idx ? strokeWidth + 6 : strokeWidth}
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setHoveredIdx(slice.idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              tabIndex={0}
              role="button"
              aria-label={`${slice.item.categoryLabel}: ${formatCurrency(slice.item.allocatedAmount, currency)} (${Math.round(slice.percent)}%)`}
              onFocus={() => setHoveredIdx(slice.idx)}
              onBlur={() => setHoveredIdx(null)}
            />
          ))}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          {activeSlice ? (
            <>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                {activeSlice.item.categoryLabel}
              </span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {formatCurrency(activeSlice.item.allocatedAmount, currency)}
              </span>
              <span className="text-xs font-bold text-rose-500">
                {Math.round(activeSlice.percent)}% of allocated
              </span>
            </>
          ) : (
            <>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total Budget
              </span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(totalBudget, currency)}
              </span>
              <span className="text-[11px] text-slate-400">
                {formatCurrency(totalAllocated, currency)} allocated
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-6 w-full max-w-sm">
        {slices.map((slice) => (
          <div
            key={slice.item.id}
            onMouseEnter={() => setHoveredIdx(slice.idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            className={`flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
              hoveredIdx === slice.idx ? 'bg-slate-100 dark:bg-slate-800 font-semibold' : ''
            }`}
          >
            <span
              className="w-3 h-3 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: slice.color }}
            />
            <span className="truncate text-slate-700 dark:text-slate-300">
              {slice.item.categoryLabel}
            </span>
            <span className="ml-auto font-mono text-slate-500 dark:text-slate-400 text-[11px]">
              {Math.round(slice.percent)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
