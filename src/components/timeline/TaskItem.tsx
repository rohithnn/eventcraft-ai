import React from 'react';
import { TimelineTask } from '../../types/event';
import { formatFriendlyDate, isTaskOverdue } from '../../utils/dateUtils';
import { Check, Clock, AlertCircle, Trash2, User } from 'lucide-react';

interface TaskItemProps {
  task: TimelineTask;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggleStatus, onDelete }: TaskItemProps) {
  const isCompleted = task.status === 'completed';
  const overdue = isTaskOverdue(task.dueDate, task.status);

  const priorityStyles = {
    high: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900',
    medium: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900',
    low: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
  };

  return (
    <div
      className={`p-4 rounded-2xl border transition-all duration-150 flex items-start gap-3.5 ${
        isCompleted
          ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75'
          : overdue
          ? 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 shadow-sm'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-md'
      }`}
    >
      {/* Checkbox Button */}
      <button
        onClick={() => onToggleStatus(task.id)}
        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 ${
          isCompleted
            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
            : 'border-slate-300 dark:border-slate-600 hover:border-rose-500 bg-white dark:bg-slate-800'
        }`}
        aria-label={isCompleted ? `Mark "${task.title}" as incomplete` : `Mark "${task.title}" as completed`}
      >
        {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
      </button>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {/* Timeframe Pill */}
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
            <Clock className="w-3 h-3" />
            {task.timeframe}
          </span>

          {/* Priority */}
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${priorityStyles[task.priority]}`}>
            {task.priority}
          </span>

          {/* Overdue Badge */}
          {overdue && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
              <AlertCircle className="w-3 h-3" />
              Overdue
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className={`text-sm font-bold tracking-tight ${isCompleted ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Due Date & Assignee metadata */}
        <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 dark:text-slate-500">
          <span>Target Date: {formatFriendlyDate(task.dueDate)}</span>
          {task.assignedTo && (
            <span className="inline-flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" />
              {task.assignedTo}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <button
        onClick={() => onDelete(task.id)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
        aria-label={`Delete task ${task.title}`}
        title="Delete task"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
