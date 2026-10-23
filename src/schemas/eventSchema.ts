import { z } from 'zod';

export const BudgetCategoryEnum = z.enum([
  'venue',
  'catering',
  'decor',
  'photography',
  'entertainment',
  'attire',
  'misc',
]);

export const CurrencyCodeEnum = z.enum(['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY']);
export const EventTypeEnum = z.enum(['wedding', 'birthday', 'community', 'custom']);

export const WizardInputSchema = z.object({
  title: z.string().trim().min(3, 'Event title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
  eventType: EventTypeEnum,
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Please select a valid date',
  }),
  guestCount: z.number().int().min(1, 'Guest count must be at least 1').max(50000, 'Guest count cannot exceed 50,000'),
  city: z.string().trim().min(2, 'City is required').max(100, 'City name is too long'),
  totalBudget: z.number().min(50, 'Budget must be at least 50').max(100000000, 'Budget exceeds allowed limit'),
  currency: CurrencyCodeEnum,
  themeVibe: z.string().trim().max(300, 'Theme description too long').default('Elegant & Celebratory'),
  culturalPreferences: z.string().trim().max(300, 'Cultural preferences too long').default(''),
  dietaryNeeds: z.string().trim().max(300, 'Dietary needs too long').default(''),
  accessibilityNeeds: z.string().trim().max(300, 'Accessibility needs too long').default(''),
});

export type WizardInputData = z.infer<typeof WizardInputSchema>;

export const AIBudgetItemSchema = z.object({
  category: BudgetCategoryEnum,
  categoryLabel: z.string().min(1),
  allocatedAmount: z.number().nonnegative(),
  percentageOfBudget: z.number().nonnegative(),
  notes: z.string().optional(),
  suggestedVendorsOrTips: z.string().optional(),
});

export const AITimelineTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500),
  category: z.string(),
  timeframe: z.string().min(1),
  relativeDaysBefore: z.number().int().nonnegative(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

export const AIIdeaItemSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(600),
  tags: z.array(z.string()).default([]),
});

export const AIIdeasSectionSchema = z.object({
  themes: z.array(AIIdeaItemSchema).min(1),
  decor: z.array(AIIdeaItemSchema).min(1),
  menu: z.array(AIIdeaItemSchema).min(1),
  activities: z.array(AIIdeaItemSchema).min(1),
  returnGifts: z.array(AIIdeaItemSchema).min(1),
});

export const AIVendorSuggestedSchema = z.object({
  category: BudgetCategoryEnum,
  categoryLabel: z.string(),
  questions: z.array(z.string().min(3)).min(2),
});

export const AIGeneratePlanResponseSchema = z.object({
  overview: z.string().max(600).optional(),
  budget: z.array(AIBudgetItemSchema).min(4),
  timeline: z.array(AITimelineTaskSchema).min(5),
  ideas: AIIdeasSectionSchema,
  vendorQuestions: z.array(AIVendorSuggestedSchema).optional(),
});

export type AIGeneratePlanResponse = z.infer<typeof AIGeneratePlanResponseSchema>;
