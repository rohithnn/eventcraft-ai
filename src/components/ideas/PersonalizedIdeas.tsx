import React, { useState } from 'react';
import { EventIdeas, IdeaItem, EventDetails } from '../../types/event';
import { Sparkles, Bookmark, BookmarkCheck, RefreshCw, Palette, Utensils, Gift, Gamepad2, Layers } from 'lucide-react';

interface PersonalizedIdeasProps {
  ideas: EventIdeas;
  eventDetails: EventDetails;
  onTogglePin: (section: keyof EventIdeas, ideaId: string) => void;
  onRegenerate: (userTweakPrompt?: string) => Promise<void>;
  isRegenerating: boolean;
}

export function PersonalizedIdeas({
  ideas,
  eventDetails,
  onTogglePin,
  onRegenerate,
  isRegenerating,
}: PersonalizedIdeasProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'themes' | 'decor' | 'menu' | 'activities' | 'returnGifts' | 'pinned'>('all');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showTweakInput, setShowTweakInput] = useState(false);

  const sections: Array<{
    key: keyof EventIdeas;
    label: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    { key: 'themes', label: 'Theme & Aesthetic Palettes', icon: <Palette className="w-4 h-4 text-rose-500" />, color: 'rose' },
    { key: 'decor', label: 'Decor & Ambiance Concepts', icon: <Layers className="w-4 h-4 text-indigo-500" />, color: 'indigo' },
    { key: 'menu', label: 'Signature Menu & Drink Concepts', icon: <Utensils className="w-4 h-4 text-emerald-500" />, color: 'emerald' },
    { key: 'activities', label: 'Interactive Games & Moments', icon: <Gamepad2 className="w-4 h-4 text-purple-500" />, color: 'purple' },
    { key: 'returnGifts', label: 'Curated Return Gifts & Favors', icon: <Gift className="w-4 h-4 text-amber-500" />, color: 'amber' },
  ];

  const handleRegenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onRegenerate(customPrompt.trim() || undefined);
    setCustomPrompt('');
    setShowTweakInput(false);
  };

  // Compute all pinned ideas
  const allPinned = sections.flatMap((s) =>
    ideas[s.key]
      .filter((item) => item.isPinned)
      .map((item) => ({ item, sectionKey: s.key, sectionLabel: s.label }))
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Curated Celebration Ideas
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300">
              {allPinned.length} Saved to Plan
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Personalized themes, menu pairings, and guest activities tailored to {eventDetails.themeVibe}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTweakInput(!showTweakInput)}
            disabled={isRegenerating}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            {isRegenerating ? 'Generating...' : 'Regenerate Ideas'}
          </button>
        </div>
      </div>

      {/* Optional Prompt Tweak input */}
      {showTweakInput && (
        <form onSubmit={handleRegenerateSubmit} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-3 animate-in fade-in">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="e.g., 'Focus on evening outdoor lighting' or 'Provide nut-free dessert table options'"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <button
            type="submit"
            disabled={isRegenerating}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
          >
            Ask Gemini
          </button>
          <button
            type="button"
            onClick={() => setShowTweakInput(false)}
            className="px-3 py-2 rounded-xl text-slate-500 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'all'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          All Categories
        </button>
        <button
          onClick={() => setActiveTab('pinned')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1 ${
            activeTab === 'pinned'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <BookmarkCheck className="w-3.5 h-3.5 text-rose-500" />
          Saved Ideas ({allPinned.length})
        </button>
        {sections.map((sec) => (
          <button
            key={sec.key}
            onClick={() => setActiveTab(sec.key as any)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === sec.key
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {sec.label.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Pinned Tab View */}
      {activeTab === 'pinned' && (
        <div className="space-y-4">
          {allPinned.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allPinned.map(({ item, sectionKey, sectionLabel }) => (
                <IdeaCard
                  key={item.id}
                  item={item}
                  sectionLabel={sectionLabel}
                  onTogglePin={() => onTogglePin(sectionKey, item.id)}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
              <Bookmark className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold">No ideas saved yet.</p>
              <p className="text-xs mt-1">Click the bookmark icon on any card below to pin it to your event plan.</p>
            </div>
          )}
        </div>
      )}

      {/* Category Sections View */}
      {activeTab !== 'pinned' && (
        <div className="space-y-8">
          {sections
            .filter((s) => activeTab === 'all' || activeTab === s.key)
            .map((sec) => {
              const list = ideas[sec.key] || [];
              if (list.length === 0) return null;

              return (
                <div key={sec.key} className="space-y-3">
                  <div className="flex items-center gap-2">
                    {sec.icon}
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {sec.label}
                    </h4>
                    <span className="text-xs text-slate-400">({list.length})</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {list.map((item) => (
                      <IdeaCard
                        key={item.id}
                        item={item}
                        sectionLabel={sec.label}
                        onTogglePin={() => onTogglePin(sec.key, item.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

interface IdeaCardProps {
  item: IdeaItem;
  sectionLabel: string;
  onTogglePin: () => void;
}

function IdeaCard({ item, sectionLabel, onTogglePin }: IdeaCardProps) {
  return (
    <div
      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
        item.isPinned
          ? 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 shadow-sm'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-md'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h5 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
            {item.title}
          </h5>
          <button
            onClick={onTogglePin}
            className={`p-2 rounded-xl transition-colors shrink-0 ${
              item.isPinned
                ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={item.isPinned ? 'Remove from saved ideas' : 'Save idea to plan'}
            aria-label={item.isPinned ? `Remove ${item.title} from saved ideas` : `Save ${item.title} to plan`}
          >
            {item.isPinned ? <BookmarkCheck className="w-4 h-4 fill-rose-500" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          {item.description}
        </p>
      </div>

      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          {item.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
