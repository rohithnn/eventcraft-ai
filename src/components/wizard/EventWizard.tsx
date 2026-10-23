import React, { useState } from 'react';
import { Sparkles, Calendar, IndianRupee, Users, MapPin, Heart, AlertCircle, ArrowRight } from 'lucide-react';
import { WizardInputData, WizardInputSchema } from '../../schemas/eventSchema';
import { EventType, CurrencyCode, FullEventPlan } from '../../types/event';
import { PREBUILT_SAMPLES } from '../../constants/samples';
import { LoadingSkeleton } from '../common/LoadingSkeleton';

interface EventWizardProps {
  onPlanGenerated: (plan: FullEventPlan) => void;
  onLoadSample: (sample: FullEventPlan) => void;
  onCancel?: () => void;
  isGenerating: boolean;
  onGenerate: (data: WizardInputData) => Promise<void>;
  loadingMessage?: string;
  errorMessage?: string | null;
}

export function EventWizard({
  onPlanGenerated,
  onLoadSample,
  onCancel,
  isGenerating,
  onGenerate,
  loadingMessage,
  errorMessage,
}: EventWizardProps) {
  // Default values tailored for Indian celebrations in Rupees
  const [formData, setFormData] = useState<WizardInputData>({
    title: 'Priya & Aarav’s Grand Royal Wedding',
    eventType: 'wedding',
    date: '2027-11-20',
    guestCount: 400,
    city: 'Jaipur, Rajasthan',
    totalBudget: 2500000, // ₹25,00,000 (25 Lakhs)
    currency: 'INR',
    themeVibe: 'Royal Rajputana Heritage with Marigold, Rose Petals & Fairy Lights',
    culturalPreferences: '3-Day Wedding: Mehendi, Sangeet Night, Morning Haldi & Vedic Pheras',
    dietaryNeeds: 'Pure Vegetarian with Jain food counter, Live Chaat Gali & Traditional Mithai',
    accessibilityNeeds: 'Wheelchair ramps for elders (Dadi/Nani), shaded seating near Mandap',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (field: keyof WizardInputData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for that field
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = WizardInputSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    await onGenerate(result.data);
  };

  const handleSelectSample = (sampleKey: string) => {
    const sample = PREBUILT_SAMPLES[sampleKey];
    if (sample) {
      onLoadSample(sample);
    }
  };

  if (isGenerating) {
    return <LoadingSkeleton message={loadingMessage || 'Architecting budget breakdown and backward timeline with Gemini...'} />;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-colors">
      {/* Wizard Header Banner */}
      <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 p-6 sm:p-8 text-white relative">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Event Blueprint
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Design Your Next Celebration
          </h2>
          <p className="mt-2 text-rose-50 text-sm leading-relaxed">
            Tell Gemini about your vision. We’ll generate a balanced 7-category budget, backward-planned milestones, vendor targets, and curated theme ideas.
          </p>
        </div>

        {/* Quick Sample Selector */}
        <div className="mt-6 pt-5 border-t border-white/20 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-rose-100 uppercase tracking-wider mr-2">
            Try a Prebuilt Plan:
          </span>
          <button
            type="button"
            onClick={() => handleSelectSample('wedding')}
            className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-sm transition-colors cursor-pointer"
          >
            🪷 Royal Jaipur Wedding (₹35 Lakhs)
          </button>
          <button
            type="button"
            onClick={() => handleSelectSample('birthday')}
            className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-sm transition-colors cursor-pointer"
          >
            🎂 Annaprashan & 1st Birthday (₹2.5 Lakhs)
          </button>
          <button
            type="button"
            onClick={() => handleSelectSample('community')}
            className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-sm transition-colors cursor-pointer"
          >
            🪔 Diwali & Dandiya Utsav (₹6 Lakhs)
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="m-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Generation Notice</p>
            <p className="text-xs mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8" noValidate>
        {/* Section 1: Event Essentials */}
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center">
              1
            </span>
            Event Essentials
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Event Type */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label htmlFor="eventType" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Event Type <span className="text-rose-500">*</span>
              </label>
              <select
                id="eventType"
                value={formData.eventType}
                onChange={(e) => handleFieldChange('eventType', e.target.value as EventType)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
              >
                <option value="wedding">💍 Wedding & Reception</option>
                <option value="birthday">🎂 Birthday & Milestone Celebration</option>
                <option value="community">🎪 Community Gathering & Festival</option>
                <option value="custom">✨ Custom Event / Gala</option>
              </select>
            </div>

            {/* Event Title */}
            <div className="sm:col-span-2">
              <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Event Name / Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                placeholder="e.g., Sarah & Daniel's Seaside Wedding"
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                aria-describedby={errors.title ? 'title-error' : undefined}
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border ${
                  errors.title ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                } text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors`}
              />
              {errors.title && (
                <p id="title-error" className="text-xs text-rose-500 mt-1">
                  {errors.title}
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleFieldChange('date', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors"
                />
              </div>
            </div>

            {/* Guest Count */}
            <div>
              <label htmlFor="guestCount" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Guest Count <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="guestCount"
                  type="number"
                  min="1"
                  max="50000"
                  value={formData.guestCount}
                  onChange={(e) => handleFieldChange('guestCount', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors"
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                City / Location <span className="text-rose-500">*</span>
              </label>
              <input
                id="city"
                type="text"
                placeholder="e.g. Austin, TX or London, UK"
                value={formData.city}
                onChange={(e) => handleFieldChange('city', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Financial Foundation */}
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center">
              2
            </span>
            Budget & Financial Target
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Total Budget */}
            <div className="sm:col-span-2">
              <label htmlFor="totalBudget" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Total Budget <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <IndianRupee className="w-4 h-4 text-rose-500" />
                </div>
                <input
                  id="totalBudget"
                  type="number"
                  step="1000"
                  min="50"
                  value={formData.totalBudget}
                  onChange={(e) => handleFieldChange('totalBudget', parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors"
                />
              </div>
            </div>

            {/* Currency */}
            <div>
              <label htmlFor="currency" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Currency
              </label>
              <select
                id="currency"
                value={formData.currency}
                onChange={(e) => handleFieldChange('currency', e.target.value as CurrencyCode)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors"
              >
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Vibe & Experience Preferences */}
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center">
              3
            </span>
            Theme, Cultural & Accessibility Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Theme / Vibe */}
            <div className="sm:col-span-2">
              <label htmlFor="themeVibe" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Theme / Aesthetic & Vibe
              </label>
              <input
                id="themeVibe"
                type="text"
                placeholder="e.g. Modern Minimalist, Retro 80s Disco, Romantic Boho, Eco-friendly Carnival"
                value={formData.themeVibe}
                onChange={(e) => handleFieldChange('themeVibe', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors"
              />
            </div>

            {/* Cultural Preferences */}
            <div>
              <label htmlFor="culturalPreferences" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Cultural / Traditional Preferences
              </label>
              <input
                id="culturalPreferences"
                type="text"
                placeholder="e.g., Bilingual vows, Sangeet dances, Tea ceremony, Traditional blessings"
                value={formData.culturalPreferences}
                onChange={(e) => handleFieldChange('culturalPreferences', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors"
              />
            </div>

            {/* Dietary Needs */}
            <div>
              <label htmlFor="dietaryNeeds" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Dietary Accommodations
              </label>
              <input
                id="dietaryNeeds"
                type="text"
                placeholder="e.g., Vegan, Halal, Celiac / Gluten-free, Nut allergies"
                value={formData.dietaryNeeds}
                onChange={(e) => handleFieldChange('dietaryNeeds', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors"
              />
            </div>

            {/* Accessibility Needs */}
            <div className="sm:col-span-2">
              <label htmlFor="accessibilityNeeds" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Accessibility & Inclusion Needs
              </label>
              <input
                id="accessibilityNeeds"
                type="text"
                placeholder="e.g., Step-free wheelchair access, sensory quiet room, ASL sign interpreter, large-print menus"
                value={formData.accessibilityNeeds}
                onChange={(e) => handleFieldChange('accessibilityNeeds', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
          ) : <div />}

          <button
            type="submit"
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5" />
            Generate Event Plan with Gemini
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </form>
    </div>
  );
}
