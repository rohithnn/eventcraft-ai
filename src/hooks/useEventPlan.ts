import { useState, useEffect, useCallback, useMemo } from 'react';
import { FullEventPlan, BudgetItem, TimelineTask, Vendor, EventIdeas, TaskStatus, BudgetCategory } from '../types/event';
import { loadAllEvents, saveEvent, saveActiveEventId, loadActiveEventId, deleteEvent as deleteEventStorage, resetStorage } from '../services/storageService';
import { recalculateBudgetPercentages } from '../utils/budgetUtils';
import { SAMPLE_WEDDING } from '../constants/samples';

export function useEventPlan() {
  const [events, setEvents] = useState<FullEventPlan[]>(() => loadAllEvents());
  const [activeId, setActiveId] = useState<string>(() => loadActiveEventId());

  // Determine current active plan
  const activePlan = useMemo<FullEventPlan>(() => {
    const found = events.find((e) => e.details.id === activeId);
    if (found) return found;
    if (events.length > 0) return events[0];
    return SAMPLE_WEDDING;
  }, [events, activeId]);

  // Sync activeId change to storage
  const switchEvent = useCallback((id: string) => {
    setActiveId(id);
    saveActiveEventId(id);
  }, []);

  // Update and persist the active plan
  const saveCurrentPlan = useCallback((updated: FullEventPlan) => {
    setEvents((prev) => {
      const idx = prev.findIndex((e) => e.details.id === updated.details.id);
      let nextEvents: FullEventPlan[];
      if (idx >= 0) {
        nextEvents = [...prev];
        nextEvents[idx] = updated;
      } else {
        nextEvents = [updated, ...prev];
      }
      return nextEvents;
    });
    saveEvent(updated);
  }, []);

  // Budget modifications
  const updateBudgetItem = useCallback(
    (id: string, updates: Partial<BudgetItem>) => {
      const updatedBudget = activePlan.budget.map((item) => {
        if (item.id === id) {
          const nextItem = { ...item, ...updates };
          return nextItem;
        }
        return item;
      });

      const recalculated = recalculateBudgetPercentages(updatedBudget, activePlan.details.totalBudget);
      const updatedPlan: FullEventPlan = {
        ...activePlan,
        budget: recalculated,
      };
      saveCurrentPlan(updatedPlan);
    },
    [activePlan, saveCurrentPlan]
  );

  const addCustomBudgetItem = useCallback(
    (category: BudgetCategory, categoryLabel: string, allocatedAmount: number) => {
      const newItem: BudgetItem = {
        id: `b-${activePlan.details.id}-${Date.now()}`,
        category,
        categoryLabel,
        allocatedAmount,
        spentAmount: 0,
        percentageOfBudget: Math.round((allocatedAmount / Math.max(1, activePlan.details.totalBudget)) * 100),
      };
      const updatedBudget = recalculateBudgetPercentages([...activePlan.budget, newItem], activePlan.details.totalBudget);
      saveCurrentPlan({
        ...activePlan,
        budget: updatedBudget,
      });
    },
    [activePlan, saveCurrentPlan]
  );

  const deleteBudgetItem = useCallback(
    (id: string) => {
      const updatedBudget = recalculateBudgetPercentages(
        activePlan.budget.filter((b) => b.id !== id),
        activePlan.details.totalBudget
      );
      saveCurrentPlan({
        ...activePlan,
        budget: updatedBudget,
      });
    },
    [activePlan, saveCurrentPlan]
  );

  // Timeline modifications
  const toggleTaskStatus = useCallback(
    (id: string) => {
      const updatedTimeline = activePlan.timeline.map((task) => {
        if (task.id === id) {
          const nextStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
          return { ...task, status: nextStatus };
        }
        return task;
      });
      saveCurrentPlan({ ...activePlan, timeline: updatedTimeline });
    },
    [activePlan, saveCurrentPlan]
  );

  const updateTimelineTask = useCallback(
    (id: string, updates: Partial<TimelineTask>) => {
      const updatedTimeline = activePlan.timeline.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      );
      saveCurrentPlan({ ...activePlan, timeline: updatedTimeline });
    },
    [activePlan, saveCurrentPlan]
  );

  const addTimelineTask = useCallback(
    (taskData: Omit<TimelineTask, 'id'>) => {
      const newTask: TimelineTask = {
        ...taskData,
        id: `t-${activePlan.details.id}-${Date.now()}`,
      };
      saveCurrentPlan({
        ...activePlan,
        timeline: [newTask, ...activePlan.timeline],
      });
    },
    [activePlan, saveCurrentPlan]
  );

  const deleteTimelineTask = useCallback(
    (id: string) => {
      saveCurrentPlan({
        ...activePlan,
        timeline: activePlan.timeline.filter((t) => t.id !== id),
      });
    },
    [activePlan, saveCurrentPlan]
  );

  // Vendor modifications
  const addVendor = useCallback(
    (vendorData: Omit<Vendor, 'id'>) => {
      const newVendor: Vendor = {
        ...vendorData,
        id: `v-${activePlan.details.id}-${Date.now()}`,
      };
      saveCurrentPlan({
        ...activePlan,
        vendors: [...activePlan.vendors, newVendor],
      });
    },
    [activePlan, saveCurrentPlan]
  );

  const updateVendor = useCallback(
    (id: string, updates: Partial<Vendor>) => {
      const updatedVendors = activePlan.vendors.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      );
      saveCurrentPlan({ ...activePlan, vendors: updatedVendors });
    },
    [activePlan, saveCurrentPlan]
  );

  const deleteVendor = useCallback(
    (id: string) => {
      saveCurrentPlan({
        ...activePlan,
        vendors: activePlan.vendors.filter((v) => v.id !== id),
      });
    },
    [activePlan, saveCurrentPlan]
  );

  // Ideas modifications
  const togglePinIdea = useCallback(
    (section: keyof EventIdeas, ideaId: string) => {
      const currentList = activePlan.ideas[section];
      const updatedList = currentList.map((item) =>
        item.id === ideaId ? { ...item, isPinned: !item.isPinned } : item
      );
      saveCurrentPlan({
        ...activePlan,
        ideas: {
          ...activePlan.ideas,
          [section]: updatedList,
        },
      });
    },
    [activePlan, saveCurrentPlan]
  );

  const setIdeas = useCallback(
    (newIdeas: EventIdeas) => {
      saveCurrentPlan({
        ...activePlan,
        ideas: newIdeas,
      });
    },
    [activePlan, saveCurrentPlan]
  );

  // Add new event plan from wizard
  const addNewEvent = useCallback(
    (newPlan: FullEventPlan) => {
      setEvents((prev) => [newPlan, ...prev]);
      setActiveId(newPlan.details.id);
      saveEvent(newPlan);
      saveActiveEventId(newPlan.details.id);
    },
    []
  );

  // Delete current active event
  const deleteCurrentEvent = useCallback(() => {
    const remaining = deleteEventStorage(activePlan.details.id);
    setEvents(remaining);
    const nextId = remaining[0]?.details?.id || '';
    setActiveId(nextId);
    saveActiveEventId(nextId);
  }, [activePlan]);

  // Reset to initial sample events
  const resetToSamples = useCallback(() => {
    const samples = resetStorage();
    setEvents(samples);
    setActiveId(samples[0].details.id);
  }, []);

  return {
    events,
    activePlan,
    activeId,
    switchEvent,
    addNewEvent,
    deleteCurrentEvent,
    resetToSamples,
    saveCurrentPlan,
    updateBudgetItem,
    addCustomBudgetItem,
    deleteBudgetItem,
    toggleTaskStatus,
    updateTimelineTask,
    addTimelineTask,
    deleteTimelineTask,
    addVendor,
    updateVendor,
    deleteVendor,
    togglePinIdea,
    setIdeas,
  };
}
