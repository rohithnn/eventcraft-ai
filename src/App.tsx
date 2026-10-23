import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useEventPlan } from './hooks/useEventPlan';
import { useGemini } from './hooks/useGemini';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { SkipLink } from './components/common/SkipLink';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastContainer } from './components/common/Toast';
import { Modal } from './components/common/Modal';
import { EventWizard } from './components/wizard/EventWizard';
import { BudgetPlanner } from './components/budget/BudgetPlanner';
import { TimelineView } from './components/timeline/TimelineView';
import { VendorChecklist } from './components/vendor/VendorChecklist';
import { PersonalizedIdeas } from './components/ideas/PersonalizedIdeas';
import { ChatAssistant } from './components/chat/ChatAssistant';
import { ExportModal } from './components/export/ExportModal';
import { PrintablePlan } from './components/export/PrintablePlan';
import { FullEventPlan, ToastNotification, BudgetItem, BudgetCategory } from './types/event';
import { WizardInputData } from './schemas/eventSchema';
import { formatFriendlyDate, calculateDaysRemaining } from './utils/dateUtils';
import { formatCurrency } from './utils/budgetUtils';
import {
  Calendar,
  IndianRupee,
  Users,
  MapPin,
  Sparkles,
  PieChart,
  Clock,
  Briefcase,
  Lightbulb,
  Heart,
  Accessibility,
  Utensils,
  Share2,
} from 'lucide-react';

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const {
    events,
    activePlan,
    switchEvent,
    addNewEvent,
    deleteCurrentEvent,
    saveCurrentPlan,
    updateBudgetItem,
    addCustomBudgetItem,
    deleteBudgetItem,
    toggleTaskStatus,
    addTimelineTask,
    deleteTimelineTask,
    addVendor,
    updateVendor,
    deleteVendor,
    togglePinIdea,
    setIdeas,
  } = useEventPlan();

  const {
    isLoading: isAiLoading,
    loadingMessage: aiLoadingMessage,
    error: aiError,
    generatePlan,
    regenerateIdeas,
    fetchVendorQuestions,
  } = useGemini();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'budget' | 'timeline' | 'vendors' | 'ideas'>('budget');

  // Modals state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Trigger celebratory confetti on event creation
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#6366f1', '#f59e0b', '#10b981'],
      });
    } catch {}
  };

  // Handle Wizard Submission
  const handleWizardGenerate = async (formData: WizardInputData) => {
    const generated = await generatePlan(formData);
    if (generated) {
      addNewEvent(generated);
      setIsWizardOpen(false);
      triggerCelebration();
      addToast('success', `Created blueprint for "${generated.details.title}"!`);
    } else if (aiError) {
      addToast('error', aiError);
    }
  };

  const handleLoadSample = (sample: FullEventPlan) => {
    addNewEvent(sample);
    triggerCelebration();
    addToast('info', `Loaded sample plan: ${sample.details.title}`);
  };

  const handleUpdateTotalBudget = (newTotal: number, rebalancedItems: BudgetItem[]) => {
    saveCurrentPlan({
      ...activePlan,
      details: {
        ...activePlan.details,
        totalBudget: newTotal,
      },
      budget: rebalancedItems,
    });
    addToast('success', `Target budget updated to ${formatCurrency(newTotal, activePlan.details.currency)}`);
  };

  const handleRegenerateIdeas = async (userTweak?: string) => {
    const newIdeas = await regenerateIdeas(activePlan.details, userTweak);
    if (newIdeas) {
      setIdeas(newIdeas);
      addToast('success', 'Refreshed celebration ideas with Gemini!');
    }
  };

  const daysLeft = calculateDaysRemaining(activePlan.details.date);

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <SkipLink />

        {/* Global Navigation Header */}
        <Header
          events={events}
          activePlan={activePlan}
          onSelectEvent={(id) => {
            switchEvent(id);
            addToast('info', 'Switched active event');
          }}
          onOpenWizard={() => setIsWizardOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
          onLoadSample={handleLoadSample}
          onDeleteCurrent={() => {
            deleteCurrentEvent();
            addToast('warning', 'Event plan removed');
          }}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Main Content Area */}
        <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Hero Event Banner */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 p-6 sm:p-8 text-white shadow-xl shadow-rose-500/10 no-print">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm">
                    {activePlan.details.eventType}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm">
                    {daysLeft > 0 ? `⏳ ${daysLeft} Days to go` : daysLeft === 0 ? '🎉 Happening Today!' : '✨ Event Wrapped'}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  {activePlan.details.title}
                </h1>

                {/* Key stats row */}
                <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs sm:text-sm text-rose-50 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-white" />
                    {formatFriendlyDate(activePlan.details.date)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-white" />
                    {activePlan.details.guestCount} Guests
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-white" />
                    {activePlan.details.city}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 font-bold text-white">
                    <IndianRupee className="w-4 h-4" />
                    {formatCurrency(activePlan.details.totalBudget, activePlan.details.currency)} Target
                  </span>
                </div>

                {/* Theme & Accommodations Tags */}
                <div className="pt-2 flex flex-wrap gap-2 text-xs">
                  {activePlan.details.themeVibe && (
                    <span className="px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur-sm flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Theme: {activePlan.details.themeVibe}
                    </span>
                  )}
                  {activePlan.details.dietaryNeeds && (
                    <span className="px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur-sm flex items-center gap-1">
                      <Utensils className="w-3.5 h-3.5" />
                      {activePlan.details.dietaryNeeds}
                    </span>
                  )}
                  {activePlan.details.accessibilityNeeds && (
                    <span className="px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur-sm flex items-center gap-1">
                      <Accessibility className="w-3.5 h-3.5" />
                      {activePlan.details.accessibilityNeeds}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-row lg:flex-col gap-2.5 shrink-0">
                <button
                  onClick={() => setIsExportOpen(true)}
                  className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-rose-600 hover:bg-rose-50 text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-[1.02]"
                >
                  <Share2 className="w-4 h-4" />
                  Export Plan
                </button>
                <button
                  onClick={() => setIsWizardOpen(true)}
                  className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm font-bold backdrop-blur-sm transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Create New
                </button>
              </div>
            </div>
          </section>

          {/* Navigation Feature Tabs */}
          <nav
            aria-label="Event Planning Navigation"
            className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto no-print"
          >
            <button
              onClick={() => setActiveTab('budget')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === 'budget'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <PieChart className="w-4 h-4" />
              AI Budget Planner
            </button>

            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === 'timeline'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              Backward Timeline ({activePlan.timeline.length})
            </button>

            <button
              onClick={() => setActiveTab('vendors')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === 'vendors'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Vendor Checklist ({activePlan.vendors.length})
            </button>

            <button
              onClick={() => setActiveTab('ideas')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === 'ideas'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              Personalized Ideas
            </button>
          </nav>

          {/* Active Tab Panel */}
          <div className="no-print">
            {activeTab === 'budget' && (
              <BudgetPlanner
                items={activePlan.budget}
                totalBudget={activePlan.details.totalBudget}
                currency={activePlan.details.currency}
                onUpdateItem={(id, updates) => {
                  updateBudgetItem(id, updates);
                  addToast('info', 'Budget line updated');
                }}
                onAddItem={(cat, label, alloc) => {
                  addCustomBudgetItem(cat, label, alloc);
                  addToast('success', `Added "${label}" to budget`);
                }}
                onDeleteItem={(id) => {
                  deleteBudgetItem(id);
                  addToast('warning', 'Budget category removed');
                }}
                onUpdateTotalBudget={handleUpdateTotalBudget}
              />
            )}

            {activeTab === 'timeline' && (
              <TimelineView
                tasks={activePlan.timeline}
                eventDate={activePlan.details.date}
                onToggleStatus={(id) => {
                  toggleTaskStatus(id);
                  addToast('success', 'Task status updated');
                }}
                onAddTask={(task) => {
                  addTimelineTask(task);
                  addToast('success', `Scheduled milestone: "${task.title}"`);
                }}
                onDeleteTask={(id) => {
                  deleteTimelineTask(id);
                  addToast('warning', 'Milestone removed');
                }}
              />
            )}

            {activeTab === 'vendors' && (
              <VendorChecklist
                vendors={activePlan.vendors}
                currency={activePlan.details.currency}
                eventType={activePlan.details.eventType}
                guestCount={activePlan.details.guestCount}
                city={activePlan.details.city}
                onAddVendor={(vendor) => {
                  addVendor(vendor);
                  addToast('success', `Added vendor: ${vendor.name}`);
                }}
                onUpdateVendor={(id, updates) => {
                  updateVendor(id, updates);
                  addToast('info', 'Vendor status updated');
                }}
                onDeleteVendor={(id) => {
                  deleteVendor(id);
                  addToast('warning', 'Vendor entry removed');
                }}
                onFetchQuestions={(cat) =>
                  fetchVendorQuestions(cat, activePlan.details.eventType, activePlan.details.guestCount, activePlan.details.city)
                }
              />
            )}

            {activeTab === 'ideas' && (
              <PersonalizedIdeas
                ideas={activePlan.ideas}
                eventDetails={activePlan.details}
                onTogglePin={(section, ideaId) => {
                  togglePinIdea(section, ideaId);
                  addToast('info', 'Saved ideas updated');
                }}
                onRegenerate={handleRegenerateIdeas}
                isRegenerating={isAiLoading}
              />
            )}
          </div>

          {/* Printable Layout (Hidden on screen, styled for window.print()) */}
          <PrintablePlan plan={activePlan} />
        </main>

        {/* Global Footer */}
        <Footer />

        {/* Chat Assistant (Always available & context-aware) */}
        <ChatAssistant plan={activePlan} />

        {/* Wizard Modal */}
        <Modal
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          title="Create New Event Plan"
          maxWidth="2xl"
        >
          <EventWizard
            onPlanGenerated={(plan) => {
              addNewEvent(plan);
              setIsWizardOpen(false);
              triggerCelebration();
            }}
            onLoadSample={(sample) => {
              handleLoadSample(sample);
              setIsWizardOpen(false);
            }}
            onCancel={() => setIsWizardOpen(false)}
            isGenerating={isAiLoading}
            onGenerate={handleWizardGenerate}
            loadingMessage={aiLoadingMessage}
            errorMessage={aiError}
          />
        </Modal>

        {/* Export Modal */}
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          plan={activePlan}
          onImportPlan={(imported) => {
            addNewEvent(imported);
            addToast('success', `Restored plan: "${imported.details.title}"`);
          }}
        />

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      </div>
    </ErrorBoundary>
  );
}
