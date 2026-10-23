import { describe, it, expect } from 'vitest';
import { calculateDueDate, formatFriendlyDate, calculateDaysRemaining, isTaskOverdue } from '../utils/dateUtils';

describe('dateUtils', () => {
  it('calculates backward-planned due date accurately', () => {
    // 2027-06-20 minus 30 days = 2027-05-21
    const dueDate = calculateDueDate('2027-06-20', 30);
    expect(dueDate).toBe('2027-05-21');
  });

  it('handles 0 days before as exact event date', () => {
    const dueDate = calculateDueDate('2027-06-20', 0);
    expect(dueDate).toBe('2027-06-20');
  });

  it('gracefully handles invalid date string', () => {
    const dueDate = calculateDueDate('not-a-date', 10);
    expect(dueDate).toBe('not-a-date');
  });

  it('formats friendly date correctly', () => {
    const formatted = formatFriendlyDate('2027-06-20');
    expect(formatted).toContain('2027');
    expect(formatted).toContain('Jun');
  });

  it('identifies overdue tasks correctly', () => {
    // A date in 2020 is in the past
    expect(isTaskOverdue('2020-01-01', 'pending')).toBe(true);
    // Completed task is never overdue
    expect(isTaskOverdue('2020-01-01', 'completed')).toBe(false);
    // Future date is not overdue
    expect(isTaskOverdue('2099-01-01', 'pending')).toBe(false);
  });
});
