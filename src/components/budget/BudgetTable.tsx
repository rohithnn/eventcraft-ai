import React, { useState } from 'react';
import { BudgetItem, CurrencyCode, BudgetCategory } from '../../types/event';
import { BUDGET_CATEGORIES } from '../../constants/defaults';
import { formatCurrency } from '../../utils/budgetUtils';
import { AlertTriangle, CheckCircle, Plus, Trash2, Edit2, Check } from 'lucide-react';

interface BudgetTableProps {
  items: BudgetItem[];
  totalBudget: number;
  currency: CurrencyCode;
  onUpdateItem: (id: string, updates: Partial<BudgetItem>) => void;
  onAddItem: (category: BudgetCategory, label: string, allocated: number) => void;
  onDeleteItem: (id: string) => void;
}

export function BudgetTable({
  items,
  totalBudget,
  currency,
  onUpdateItem,
  onAddItem,
  onDeleteItem,
}: BudgetTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAllocated, setEditAllocated] = useState<number>(0);
  const [editSpent, setEditSpent] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>('');

  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newCategory, setNewCategory] = useState<BudgetCategory>('misc');
  const [newLabel, setNewLabel] = useState<string>('');
  const [newAmount, setNewAmount] = useState<number>(500);

  const startEdit = (item: BudgetItem) => {
    setEditingId(item.id);
    setEditAllocated(item.allocatedAmount);
    setEditSpent(item.spentAmount);
    setEditNotes(item.notes || '');
  };

  const saveEdit = (id: string) => {
    onUpdateItem(id, {
      allocatedAmount: Number(editAllocated) || 0,
      spentAmount: Number(editSpent) || 0,
      notes: editNotes,
    });
    setEditingId(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    onAddItem(newCategory, newLabel.trim(), Number(newAmount) || 0);
    setNewLabel('');
    setNewAmount(500);
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left text-sm border-collapse" aria-label="Event Budget Allocation and Spending Table">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th scope="col" className="py-3.5 px-4">Category</th>
              <th scope="col" className="py-3.5 px-4 text-right">Allocated</th>
              <th scope="col" className="py-3.5 px-4 text-right">Actual Spent</th>
              <th scope="col" className="py-3.5 px-4 text-center">Share</th>
              <th scope="col" className="py-3.5 px-4 text-center">Status</th>
              <th scope="col" className="py-3.5 px-4 hidden md:table-cell">Notes & Details</th>
              <th scope="col" className="py-3.5 px-4 text-right no-print">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {items.map((item) => {
              const meta = BUDGET_CATEGORIES.find((c) => c.key === item.category);
              const isOver = item.spentAmount > item.allocatedAmount;
              const isBeingEdited = editingId === item.id;

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                    isOver ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''
                  }`}
                >
                  {/* Category Name */}
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: meta?.color || '#94a3b8' }}
                      />
                      <span>{item.categoryLabel}</span>
                    </div>
                  </td>

                  {/* Allocated Amount */}
                  <td className="py-3.5 px-4 text-right font-medium">
                    {isBeingEdited ? (
                      <input
                        type="number"
                        min="0"
                        value={editAllocated}
                        onChange={(e) => setEditAllocated(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-24 text-right px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                        aria-label={`Edit allocated amount for ${item.categoryLabel}`}
                      />
                    ) : (
                      <span className="font-mono text-slate-900 dark:text-slate-100">
                        {formatCurrency(item.allocatedAmount, currency)}
                      </span>
                    )}
                  </td>

                  {/* Spent Amount */}
                  <td className="py-3.5 px-4 text-right font-medium">
                    {isBeingEdited ? (
                      <input
                        type="number"
                        min="0"
                        value={editSpent}
                        onChange={(e) => setEditSpent(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-24 text-right px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                        aria-label={`Edit spent amount for ${item.categoryLabel}`}
                      />
                    ) : (
                      <span className={`font-mono ${isOver ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                        {formatCurrency(item.spentAmount, currency)}
                      </span>
                    )}
                  </td>

                  {/* Share % */}
                  <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-500 dark:text-slate-400">
                    {item.percentageOfBudget}%
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 text-center">
                    {isOver ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Over by {formatCurrency(item.spentAmount - item.allocatedAmount, currency)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                        <CheckCircle className="w-3.5 h-3.5" />
                        On Track
                      </span>
                    )}
                  </td>

                  {/* Notes */}
                  <td className="py-3.5 px-4 hidden md:table-cell text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                    {isBeingEdited ? (
                      <input
                        type="text"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Add notes or vendor references..."
                        aria-label={`Edit notes for ${item.categoryLabel}`}
                        className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    ) : (
                      <span>{item.notes || item.suggestedVendorsOrTips || '—'}</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right no-print">
                    <div className="flex items-center justify-end gap-1.5">
                      {isBeingEdited ? (
                        <button
                          onClick={() => saveEdit(item.id)}
                          className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                          aria-label="Save changes"
                          title="Save changes"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => startEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          aria-label={`Edit ${item.categoryLabel}`}
                          title="Edit amounts"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}

                      {items.length > 3 && (
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          aria-label={`Delete ${item.categoryLabel}`}
                          title="Remove category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Custom Category Form */}
      {isAdding ? (
        <form onSubmit={handleAddSubmit} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[160px]">
            <input
              type="text"
              placeholder="Category Name (e.g. Wedding Favors)"
              aria-label="New Category Name"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>
          <div className="w-32">
            <input
              type="number"
              placeholder="Amount"
              aria-label="New Category Amount"
              min="0"
              value={newAmount}
              onChange={(e) => setNewAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-sm"
            >
              Add Category
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-xl text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors border border-rose-200 dark:border-rose-900/50"
        >
          <Plus className="w-4 h-4" />
          Add Custom Budget Category
        </button>
      )}
    </div>
  );
}
