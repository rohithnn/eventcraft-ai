import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { FullEventPlan } from '../../types/event';
import { exportPlanToPdf, exportPlanToJson, exportPlanToIcs } from '../../services/pdfExport';
import { formatCurrency } from '../../utils/budgetUtils';
import { FullEventPlanSchema } from '../../schemas/eventSchema';
import { FileText, Download, Printer, Copy, Check, Upload, Calendar } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: FullEventPlan;
  onImportPlan?: (importedPlan: FullEventPlan) => void;
}

export function ExportModal({ isOpen, onClose, plan, onImportPlan }: ExportModalProps) {
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    exportPlanToPdf(plan);
  };

  const handleDownloadJson = () => {
    exportPlanToJson(plan);
  };

  const handleDownloadIcs = () => {
    exportPlanToIcs(plan);
  };

  const handleCopySummary = () => {
    const summaryText = `EventCraft AI Plan: ${plan.details.title}
Date: ${plan.details.date}
Location: ${plan.details.city}
Guests: ${plan.details.guestCount}
Total Budget: ${formatCurrency(plan.details.totalBudget, plan.details.currency)}
Theme: ${plan.details.themeVibe}

Budget Categories:
${plan.budget.map((b) => `- ${b.categoryLabel}: ${formatCurrency(b.allocatedAmount, plan.details.currency)} (${b.percentageOfBudget}%)`).join('\n')}

Upcoming Timeline:
${plan.timeline.slice(0, 5).map((t) => `• [${t.dueDate}] ${t.title} (${t.status})`).join('\n')}`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const validation = FullEventPlanSchema.safeParse(parsed);
        if (validation.success) {
          if (onImportPlan) {
            onImportPlan(validation.data as FullEventPlan);
            onClose();
          }
        } else {
          setImportError(
            `Invalid plan format: ${validation.error.issues[0]?.message || 'Schema mismatch'}`
          );
        }
      } catch (err) {
        setImportError('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export & Share Event Plan"
      description="Download complete dossiers, backup data, or print formatted run-of-show sheets."
      maxWidth="lg"
    >
      <div className="space-y-4">
        {importError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
            {importError}
          </div>
        )}

        {/* Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* PDF Download */}
          <button
            onClick={handleDownloadPdf}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-rose-500 dark:hover:border-rose-500 bg-white dark:bg-slate-900 hover:bg-rose-50/20 dark:hover:bg-rose-950/20 transition-all text-left flex items-start gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Download PDF Dossier
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Full 4-part dossier with budgets, timelines, vendors, and ideas.
              </p>
            </div>
          </button>

          {/* Print Friendly */}
          <button
            onClick={handlePrint}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-white dark:bg-slate-900 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all text-left flex items-start gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Print / Save as PDF
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Print-friendly view formatted for paper binders and clipboard hand-outs.
              </p>
            </div>
          </button>

          {/* JSON Backup Download */}
          <button
            onClick={handleDownloadJson}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-slate-900 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all text-left flex items-start gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Export JSON Data
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Export machine-readable structured JSON backup to restore later.
              </p>
            </div>
          </button>

          {/* iCalendar (.ics) Export */}
          <button
            onClick={handleDownloadIcs}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 bg-white dark:bg-slate-900 hover:bg-purple-50/20 dark:hover:bg-purple-950/20 transition-all text-left flex items-start gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Sync Calendar (.ics)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Download timeline milestones for Google, Apple, or Outlook Calendar.
              </p>
            </div>
          </button>

          {/* Copy Summary */}
          <button
            onClick={handleCopySummary}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 bg-white dark:bg-slate-900 hover:bg-amber-50/20 dark:hover:bg-amber-950/20 transition-all text-left flex items-start gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {copied ? 'Copied to Clipboard!' : 'Copy Text Overview'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Copy condensed summary for email or messaging collaborators.
              </p>
            </div>
          </button>
        </div>

        {/* Import JSON Section */}
        {onImportPlan && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h5 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                Restore Plan from Backup
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload a previously exported .json plan file
              </p>
            </div>
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              Upload JSON
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
