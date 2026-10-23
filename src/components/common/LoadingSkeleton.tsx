import React from 'react';
import { Sparkles } from 'lucide-react';

interface LoadingSkeletonProps {
  message?: string;
  onCancel?: () => void;
}

export function LoadingSkeleton({
  message = 'Crafting your personalized event plan with Gemini...',
  onCancel,
}: LoadingSkeletonProps) {
  return (
    <div
      className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center"
      role="status"
      aria-live="polite"
    >
      <div className="relative w-16 h-16 mx-auto mb-5">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-500 opacity-20 animate-ping" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
          <Sparkles className="w-8 h-8 animate-spin" style={{ animationDuration: '3s' }} />
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
        {message}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
        Structuring balanced budget percentages, backward-planned milestones, and creative ideas.
      </p>

      {/* Shimmering skeleton bars */}
      <div className="space-y-3 max-w-md mx-auto mb-6">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-full animate-pulse" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-4/5 mx-auto animate-pulse" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-2/3 mx-auto animate-pulse" />
      </div>

      {onCancel && (
        <button
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 rounded p-1"
        >
          Cancel generation
        </button>
      )}
    </div>
  );
}
