import React from 'react';
import { Sparkles, ShieldCheck, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-8 no-print transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-rose-500" />
          <span className="font-semibold text-slate-700 dark:text-slate-200">EventCraft AI</span>
          <span>• Production-grade event architect powered by Gemini 3.8 Flash</span>
        </div>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            Prompt-Injection Guarded & Sanitized
          </span>
          <span>•</span>
          <span>WCAG 2.1 AA Compliant</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for celebrations
          </span>
        </div>
      </div>
    </footer>
  );
}
