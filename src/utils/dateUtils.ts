/**
 * Date utility functions for backward timeline calculations and friendly formatting
 */

/**
 * Calculates a backward due date by subtracting relativeDaysBefore from the eventDate
 * @param eventDateString ISO or YYYY-MM-DD date string
 * @param relativeDaysBefore Number of days before the event
 * @returns YYYY-MM-DD string
 */
export function calculateDueDate(eventDateString: string, relativeDaysBefore: number): string {
  try {
    const eventDate = new Date(eventDateString);
    if (isNaN(eventDate.getTime())) {
      return eventDateString;
    }
    const targetDate = new Date(eventDate.getTime());
    targetDate.setDate(targetDate.getDate() - Math.max(0, relativeDaysBefore));
    return targetDate.toISOString().split('T')[0];
  } catch {
    return eventDateString;
  }
}

/**
 * Formats a date string into a friendly localized readable date (e.g. "Jun 18, 2027")
 */
export function formatFriendlyDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Calculates countdown in days between today and the event date
 */
export function calculateDaysRemaining(eventDateString: string): number {
  try {
    const eventDate = new Date(eventDateString);
    if (isNaN(eventDate.getTime())) return 0;
    const today = new Date();
    // Normalize to midnight UTC for clean day difference
    const diffMs = eventDate.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * Determines if a due date is in the past
 */
export function isTaskOverdue(dueDateString: string, taskStatus: string): boolean {
  if (taskStatus === 'completed') return false;
  try {
    const due = new Date(dueDateString);
    if (isNaN(due.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due.getTime() < today.getTime();
  } catch {
    return false;
  }
}
