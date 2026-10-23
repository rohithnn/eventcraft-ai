import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskItem } from '../components/timeline/TaskItem';
import { DonutChart } from '../components/budget/DonutChart';
import { TimelineTask, BudgetItem } from '../types/event';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

const mockTask: TimelineTask = {
  id: 'task-1',
  title: 'Book Photographer & Videographer',
  description: 'Interview 3 candidates and compare portfolios',
  category: 'photography',
  timeframe: '6 months before',
  relativeDaysBefore: 180,
  dueDate: '2027-01-15',
  status: 'pending',
  priority: 'high',
};

const mockBudgetItems: BudgetItem[] = [
  { id: '1', category: 'venue', categoryLabel: 'Venue & Location', allocatedAmount: 8000, spentAmount: 7500, percentageOfBudget: 40 },
  { id: '2', category: 'catering', categoryLabel: 'Food & Beverage', allocatedAmount: 6000, spentAmount: 6000, percentageOfBudget: 30 },
  { id: '3', category: 'decor', categoryLabel: 'Decor & Florals', allocatedAmount: 3000, spentAmount: 2500, percentageOfBudget: 15 },
];

describe('Component tests', () => {
  it('renders TaskItem with title, timeframe, and toggles status on click', () => {
    const handleToggle = vi.fn();
    const handleDelete = vi.fn();

    render(
      <TaskItem
        task={mockTask}
        onToggleStatus={handleToggle}
        onDelete={handleDelete}
      />
    );

    expect(screen.getByText('Book Photographer & Videographer')).toBeInTheDocument();
    expect(screen.getByText('6 months before')).toBeInTheDocument();

    const checkbox = screen.getByRole('button', { name: /Mark "Book Photographer & Videographer" as completed/i });
    fireEvent.click(checkbox);
    expect(handleToggle).toHaveBeenCalledWith('task-1');
  });

  it('renders DonutChart with accessible SVG label and items', () => {
    render(
      <DonutChart
        items={mockBudgetItems}
        totalBudget={20000}
        currency="USD"
      />
    );

    const svgChart = screen.getByRole('img', { name: /donut chart representing budget distribution/i });
    expect(svgChart).toBeInTheDocument();
    expect(screen.getByText('Venue & Location')).toBeInTheDocument();
    expect(screen.getByText('Food & Beverage')).toBeInTheDocument();
  });

  it('renders ErrorBoundary fallback when a child throws', () => {
    const ThrowingComponent = () => {
      throw new Error('Test crash in child component');
    };

    // Suppress console.error during expected throw
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something unexpected happened')).toBeInTheDocument();
    expect(screen.getByText(/Test crash in child component/i)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
