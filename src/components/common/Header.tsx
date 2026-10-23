import React, { useState } from 'react';
import { Sparkles, Calendar, Plus, Sun, Moon, Download, ChevronDown, Check, Trash2 } from 'lucide-react';
import { FullEventPlan } from '../../types/event';
import { formatFriendlyDate } from '../../utils/dateUtils';
import { PREBUILT_SAMPLES } from '../../constants/samples';

interface HeaderProps {
  events: FullEventPlan[];
  activePlan: FullEventPlan;
  onSelectEvent: (id: string) => void;
  onOpenWizard: () => void;
  onOpenExport: () => void;
  onLoadSample: (samplePlan: FullEventPlan) => void;
  onDeleteCurrent: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Header({
  events,
  activePlan,
  onSelectEvent,
  onOpenWizard,
  onOpenExport,
  onLoadSample,
  onDeleteCurrent,
  theme,
  onToggleTheme,
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 no-print transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                EventCraft<span className="text-rose-500">.ai</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                GenAI Planner
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Intelligent budgets, timelines & creative ideas
            </p>
          </div>
        </div>

        {/* Center: Event Selector & Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-left border border-slate-200 dark:border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            aria-label="Select active event"
          >
            <Calendar className="w-4 h-4 text-rose-500 shrink-0" />
            <div className="max-w-[140px] sm:max-w-[220px] truncate">
              <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">
                {activePlan.details.title}
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {formatFriendlyDate(activePlan.details.date)} • {activePlan.details.guestCount} guests
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div
              className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              role="menu"
            >
              <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Your Saved Events ({events.length})
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1">
                {events.map((ev) => {
                  const isSelected = ev.details.id === activePlan.details.id;
                  return (
                    <button
                      key={ev.details.id}
                      onClick={() => {
                        onSelectEvent(ev.details.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors text-sm ${
                        isSelected
                          ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-100 font-semibold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                      role="menuitem"
                    >
                      <div className="truncate pr-2">
                        <p className="truncate font-medium">{ev.details.title}</p>
                        <p className="text-xs text-slate-400">
                          {formatFriendlyDate(ev.details.date)} • {ev.details.city}
                        </p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-rose-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2 space-y-1">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onOpenWizard();
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Plan New Event (AI Wizard)
                </button>

                {/* Prebuilt Samples Quick Launch */}
                <div className="px-2 pt-1 pb-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Try Prebuilt Samples:
                  </p>
                  <div className="flex gap-1.5">
                    {Object.entries(PREBUILT_SAMPLES).map(([key, sample]) => (
                      <button
                        key={key}
                        onClick={() => {
                          onLoadSample(sample);
                          setIsDropdownOpen(false);
                        }}
                        className="flex-1 py-1 px-1.5 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-center transition-colors truncate"
                      >
                        {key === 'wedding' ? 'Jaipur (₹35L)' : key === 'birthday' ? 'Birthday (₹2.5L)' : 'Diwali (₹6L)'}
                      </button>
                    ))}
                  </div>
                </div>

                {events.length > 1 && (
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      if (confirm(`Delete "${activePlan.details.title}"?`)) {
                        onDeleteCurrent();
                      }
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Current Event
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenWizard}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-rose-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Plan</span>
          </button>

          <button
            onClick={onOpenExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="Export plan as PDF or JSON"
            title="Export Dossier (PDF/JSON/Print)"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden md:inline">Export</span>
          </button>

          <button
            onClick={onToggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
}
