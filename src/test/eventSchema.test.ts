import { describe, it, expect } from 'vitest';
import { WizardInputSchema, AIGeneratePlanResponseSchema } from '../schemas/eventSchema';

describe('eventSchema validation', () => {
  it('validates a correct wizard input form', () => {
    const valid = {
      title: 'Summer Solstice Wedding',
      eventType: 'wedding',
      date: '2027-06-21',
      guestCount: 150,
      city: 'Portland, OR',
      totalBudget: 30000,
      currency: 'USD',
      themeVibe: 'Romantic Forest',
      culturalPreferences: '',
      dietaryNeeds: 'Gluten-free cake',
      accessibilityNeeds: 'Wheelchair access',
    };
    const result = WizardInputSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects invalid wizard inputs', () => {
    const invalid = {
      title: 'Hi', // too short (<3)
      eventType: 'invalid_type',
      date: 'not-a-date',
      guestCount: 0, // min 1
      city: '',
      totalBudget: 10, // min 50
      currency: 'INVALID',
    };
    const result = WizardInputSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('validates structured AI generated plan responses', () => {
    const validAiOutput = {
      overview: 'Comprehensive plan for wedding in Seattle',
      budget: [
        { category: 'venue', categoryLabel: 'Venue', allocatedAmount: 7000, percentageOfBudget: 35 },
        { category: 'catering', categoryLabel: 'Catering', allocatedAmount: 6000, percentageOfBudget: 30 },
        { category: 'decor', categoryLabel: 'Decor', allocatedAmount: 3000, percentageOfBudget: 15 },
        { category: 'photography', categoryLabel: 'Photo', allocatedAmount: 2000, percentageOfBudget: 10 },
      ],
      timeline: [
        { title: 'Reserve Venue', description: 'Pay deposit', category: 'venue', timeframe: '6 months before', relativeDaysBefore: 180, priority: 'high' },
        { title: 'Book Caterer', description: 'Menu tasting', category: 'catering', timeframe: '4 months before', relativeDaysBefore: 120, priority: 'high' },
        { title: 'Send Invites', description: 'Mail cards', category: 'misc', timeframe: '2 months before', relativeDaysBefore: 60, priority: 'medium' },
        { title: 'Final Dress Fitting', description: 'Finalize hem', category: 'attire', timeframe: '1 month before', relativeDaysBefore: 30, priority: 'medium' },
        { title: 'Day-of Setup', description: 'Arrive early', category: 'venue', timeframe: 'Day of event', relativeDaysBefore: 0, priority: 'high' },
      ],
      ideas: {
        themes: [{ title: 'Botanical Elegance', description: 'Sage & gold tones', tags: ['Earthy'] }],
        decor: [{ title: 'Fairy lights', description: 'Warm LEDs', tags: ['Lighting'] }],
        menu: [{ title: 'Lavender cocktail', description: 'Gin & lavender', tags: ['Signature'] }],
        activities: [{ title: 'Polaroid wall', description: 'Guest snaps', tags: ['Interactive'] }],
        returnGifts: [{ title: 'Wildflower seeds', description: 'Eco envelopes', tags: ['Eco'] }],
      },
    };

    const result = AIGeneratePlanResponseSchema.safeParse(validAiOutput);
    expect(result.success).toBe(true);
  });

  it('catches malformed AI output (missing sections or invalid types)', () => {
    const malformed = {
      budget: [{ category: 'venue' }], // missing allocatedAmount & percentageOfBudget
      timeline: [], // requires min 5
      ideas: {}, // missing required arrays
    };
    const result = AIGeneratePlanResponseSchema.safeParse(malformed);
    expect(result.success).toBe(false);
  });
});
