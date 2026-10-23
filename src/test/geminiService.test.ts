import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePlanFromGemini, getVendorQuestionsFromGemini } from '../services/geminiService';
import { WizardInputData } from '../schemas/eventSchema';

const mockInput: WizardInputData = {
  title: 'Autumn Harvest Gathering',
  eventType: 'wedding',
  date: '2027-10-15',
  guestCount: 80,
  city: 'Denver, CO',
  totalBudget: 15000,
  currency: 'USD',
  themeVibe: 'Rustic Warmth',
  culturalPreferences: '',
  dietaryNeeds: 'Vegetarian',
  accessibilityNeeds: 'Wheelchair access',
};

describe('geminiService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('generates an event plan on successful backend response', async () => {
    const mockResponseData = {
      success: true,
      data: {
        overview: 'Sample wedding plan',
        budget: [
          { category: 'venue', categoryLabel: 'Venue', allocatedAmount: 5000, percentageOfBudget: 33 },
          { category: 'catering', categoryLabel: 'Catering', allocatedAmount: 4500, percentageOfBudget: 30 },
          { category: 'decor', categoryLabel: 'Decor', allocatedAmount: 2000, percentageOfBudget: 13 },
          { category: 'photography', categoryLabel: 'Photography', allocatedAmount: 1500, percentageOfBudget: 10 },
          { category: 'entertainment', categoryLabel: 'Music', allocatedAmount: 1000, percentageOfBudget: 7 },
          { category: 'attire', categoryLabel: 'Attire', allocatedAmount: 500, percentageOfBudget: 3 },
          { category: 'misc', categoryLabel: 'Misc', allocatedAmount: 500, percentageOfBudget: 4 },
        ],
        timeline: [
          { title: 'Secure Venue', description: 'Deposit', category: 'venue', timeframe: '6 months before', relativeDaysBefore: 180, priority: 'high' },
          { title: 'Book Catering', description: 'Menu tasting', category: 'catering', timeframe: '3 months before', relativeDaysBefore: 90, priority: 'high' },
          { title: 'Send Invitations', description: 'RSVPs', category: 'misc', timeframe: '2 months before', relativeDaysBefore: 60, priority: 'medium' },
          { title: 'Final Dress Fitting', description: 'Alterations', category: 'attire', timeframe: '1 month before', relativeDaysBefore: 30, priority: 'medium' },
          { title: 'Day-of Setup', description: 'Early arrival', category: 'venue', timeframe: 'Day of event', relativeDaysBefore: 0, priority: 'high' },
        ],
        ideas: {
          themes: [{ title: 'Harvest Glow', description: 'Amber lanterns', tags: ['Autumn'] }],
          decor: [{ title: 'Pumpkin runners', description: 'Tabletop', tags: ['Decor'] }],
          menu: [{ title: 'Butternut squash soup', description: 'Warm bowls', tags: ['Appetizer'] }],
          activities: [{ title: 'Cider pressing', description: 'Interactive', tags: ['Activity'] }],
          returnGifts: [{ title: 'Maple syrup bottles', description: 'Glass bottles', tags: ['Gift'] }],
        },
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponseData,
    });

    const plan = await generatePlanFromGemini(mockInput);
    expect(plan).toBeDefined();
    expect(plan.details.title).toBe(mockInput.title);
    expect(plan.budget.length).toBe(7);
    expect(plan.timeline.length).toBe(5);
    expect(plan.ideas.themes.length).toBe(1);
  });

  it('handles 429 rate limit with friendly error message', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
    });

    const uniqueInput: WizardInputData = {
      ...mockInput,
      title: 'Rate Limit Test Event ' + Math.random(),
    };

    await expect(generatePlanFromGemini(uniqueInput)).rejects.toThrow(/rate limit/i);
  });

  it('serves cached plan on identical input without repeating fetch', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          budget: [
            { category: 'venue', categoryLabel: 'Venue', allocatedAmount: 5000, percentageOfBudget: 50 },
            { category: 'catering', categoryLabel: 'Catering', allocatedAmount: 3000, percentageOfBudget: 30 },
            { category: 'decor', categoryLabel: 'Decor', allocatedAmount: 1000, percentageOfBudget: 10 },
            { category: 'misc', categoryLabel: 'Misc', allocatedAmount: 1000, percentageOfBudget: 10 },
          ],
          timeline: [
            { title: 'T1', description: 'D1', category: 'venue', timeframe: '6m', relativeDaysBefore: 180 },
            { title: 'T2', description: 'D2', category: 'catering', timeframe: '3m', relativeDaysBefore: 90 },
            { title: 'T3', description: 'D3', category: 'misc', timeframe: '1m', relativeDaysBefore: 30 },
            { title: 'T4', description: 'D4', category: 'attire', timeframe: '1w', relativeDaysBefore: 7 },
            { title: 'T5', description: 'D5', category: 'venue', timeframe: '0d', relativeDaysBefore: 0 },
          ],
          ideas: {
            themes: [{ title: 'T', description: 'D', tags: [] }],
            decor: [{ title: 'D', description: 'D', tags: [] }],
            menu: [{ title: 'M', description: 'D', tags: [] }],
            activities: [{ title: 'A', description: 'D', tags: [] }],
            returnGifts: [{ title: 'R', description: 'D', tags: [] }],
          },
        },
      }),
    });
    global.fetch = fetchSpy;

    const cachedInput: WizardInputData = {
      ...mockInput,
      title: 'Cache Signature Test ' + Date.now(),
    };

    // First call
    const plan1 = await generatePlanFromGemini(cachedInput);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // Second call with exact same inputs
    const plan2 = await generatePlanFromGemini(cachedInput);
    expect(fetchSpy).toHaveBeenCalledTimes(1); // Cached! No second network request
    expect(plan2.details.title).toBe(plan1.details.title);
  });

  it('fetches vendor questions or falls back gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        questions: ['What is your noise curfew?', 'Are cleanup fees included?'],
      }),
    });

    const questions = await getVendorQuestionsFromGemini('venue', 'wedding', 100, 'Seattle');
    expect(questions.length).toBeGreaterThanOrEqual(2);
    expect(questions[0]).toContain('noise curfew');
  });
});
