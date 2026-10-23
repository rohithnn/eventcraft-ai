import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Sparkles, Copy, Check, MessageSquare } from 'lucide-react';

interface VendorQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorName: string;
  categoryLabel: string;
  questions: string[];
  isLoading?: boolean;
}

export function VendorQuestionsModal({
  isOpen,
  onClose,
  vendorName,
  categoryLabel,
  questions,
  isLoading,
}: VendorQuestionsModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [checkedQuestions, setCheckedQuestions] = useState<Record<number, boolean>>({});

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleChecked = (index: number) => {
    setCheckedQuestions((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`AI Vetting Questions: ${categoryLabel}`}
      description={`Tailored questions to ask "${vendorName}" before signing or confirming payment.`}
      maxWidth="xl"
    >
      <div className="space-y-4">
        <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <p>
            These questions protect your budget, clarify hidden fees, verify cancellation policies, and ensure seamless coordination on the day of the event.
          </p>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-slate-500">
            <Sparkles className="w-6 h-6 animate-spin mx-auto text-indigo-500 mb-2" />
            <p className="text-sm">Synthesizing high-impact vendor vetting questions...</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {questions.map((q, idx) => {
              const isChecked = checkedQuestions[idx] || false;
              const isCopied = copiedIndex === idx;

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition-colors flex items-start gap-3 ${
                    isChecked
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-70'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleChecked(idx)}
                    className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    aria-label="Mark question as asked"
                  />

                  <p className={`flex-1 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed ${isChecked ? 'line-through text-slate-400' : ''}`}>
                    {q}
                  </p>

                  <button
                    onClick={() => handleCopy(q, idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors shrink-0"
                    title="Copy question to clipboard"
                    aria-label="Copy question to clipboard"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
