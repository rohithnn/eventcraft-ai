import React, { useState, useMemo } from 'react';
import { TimelineTask, BudgetCategory } from '../../types/event';
import { TaskItem } from './TaskItem';
import { calculateDueDate, formatFriendlyDate, calculateDaysRemaining } from '../../utils/dateUtils';
import { Modal } from '../common/Modal';
import { Plus, Search, Calendar, CheckCircle2, Clock } from 'lucide-react';

interface TimelineViewProps {
  tasks: TimelineTask[];
  eventDate: string;
  onToggleStatus: (id: string) => void;
  onAddTask: (task: Omit<TimelineTask, 'id'>) => void;
  onDeleteTask: (id: string) => void;
}

export function TimelineView({
  tasks,
  eventDate,
  onToggleStatus,
  onAddTask,
  onDeleteTask,
}: TimelineViewProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTimeframe, setNewTimeframe] = useState('1 month before');
  const [newRelativeDays, setNewRelativeDays] = useState(30);
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newAssignee, setNewAssignee] = useState('');

  // Overall progress calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const daysLeft = calculateDaysRemaining(eventDate);

  // Filter and sort tasks backward chronologically (farthest from event first, ending on day-of)
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (filterStatus === 'pending' && task.status === 'completed') return false;
        if (filterStatus === 'completed' && task.status !== 'completed') return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            task.title.toLowerCase().includes(q) ||
            task.description.toLowerCase().includes(q) ||
            task.timeframe.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => b.relativeDaysBefore - a.relativeDaysBefore);
  }, [tasks, filterStatus, searchQuery]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const dueDate = calculateDueDate(eventDate, newRelativeDays);
    onAddTask({
      title: newTitle.trim(),
      description: newDescription.trim(),
      category: 'general',
      timeframe: newTimeframe,
      relativeDaysBefore: newRelativeDays,
      dueDate,
      status: 'pending',
      priority: newPriority,
      assignedTo: newAssignee.trim() || undefined,
    });

    setNewTitle('');
    setNewDescription('');
    setNewAssignee('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Progress & Countdown Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Backward-Planned Timeline
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300">
                {daysLeft > 0 ? `${daysLeft} days until event` : daysLeft === 0 ? 'Event is Today!' : 'Event Completed'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Event Date: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatFriendlyDate(eventDate)}</span>
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <Plus className="w-4 h-4" />
            Add Milestone Task
          </button>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-300">
              Overall Preparation Progress: {completedTasks} of {totalTasks} milestones completed
            </span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">{progressPercent}%</span>
          </div>

          <div
            className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Preparation timeline completion progress"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-colors ${
              filterStatus === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({totalTasks})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-colors ${
              filterStatus === 'pending'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Incomplete ({totalTasks - completedTasks})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-colors ${
              filterStatus === 'completed'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Completed ({completedTasks})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search milestone tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleStatus={onToggleStatus}
              onDelete={onDeleteTask}
            />
          ))
        ) : (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold">No milestone tasks match the current filter.</p>
            <p className="text-xs mt-1">Try resetting the search query or status filter.</p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Milestone Task"
        description="Schedule a backward-planned milestone anchored to your event date."
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Schedule Cake Tasting & Flavor Selection"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              placeholder="Key deliverables, vendor contacts, or requirements..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Timeframe Label
              </label>
              <select
                value={newTimeframe}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewTimeframe(val);
                  if (val === '6 months before') setNewRelativeDays(180);
                  if (val === '3 months before') setNewRelativeDays(90);
                  if (val === '1 month before') setNewRelativeDays(30);
                  if (val === '2 weeks before') setNewRelativeDays(14);
                  if (val === '1 week before') setNewRelativeDays(7);
                  if (val === 'Day of event') setNewRelativeDays(0);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="6 months before">6 months before (180 days)</option>
                <option value="3 months before">3 months before (90 days)</option>
                <option value="1 month before">1 month before (30 days)</option>
                <option value="2 weeks before">2 weeks before (14 days)</option>
                <option value="1 week before">1 week before (7 days)</option>
                <option value="Day of event">Day of event (0 days)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
              Assignee / Owner (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Maya, Julian, or Event Coordinator"
              value={newAssignee}
              onChange={(e) => setNewAssignee(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-md shadow-rose-600/20"
            >
              Save Milestone
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
