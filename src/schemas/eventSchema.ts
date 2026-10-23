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

export const VendorQuestionsRequestSchema = z.object({
  category: BudgetCategoryEnum.default('venue'),
  eventType: z.string().max(100).optional(),
  guestCount: z.number().int().positive().max(100000).optional(),
  city: z.string().max(100).optional(),
});
export type VendorQuestionsRequest = z.infer<typeof VendorQuestionsRequestSchema>;

export const IdeasGenerateRequestSchema = z.object({
  eventDetails: z
    .object({
      id: z.string().optional(),
      title: z.string().max(200).optional(),
      eventType: z.string().max(50).optional(),
      date: z.string().optional(),
      guestCount: z.number().int().nonnegative().optional(),
      city: z.string().max(100).optional(),
      totalBudget: z.number().nonnegative().optional(),
      currency: z.string().max(10).optional(),
      themeVibe: z.string().max(500).optional(),
      dietaryNeeds: z.string().max(500).optional(),
      culturalPreferences: z.string().max(500).optional(),
      accessibilityNeeds: z.string().max(500).optional(),
    })
    .optional(),
  userPrompt: z.string().max(500).optional(),
});
export type IdeasGenerateRequest = z.infer<typeof IdeasGenerateRequestSchema>;

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().max(4000),
});

export const ChatStreamRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).max(50),
  eventContext: z
    .object({
      title: z.string().max(200).optional(),
      eventType: z.string().max(50).optional(),
      date: z.string().optional(),
      city: z.string().max(100).optional(),
      guestCount: z.number().int().nonnegative().optional(),
      totalBudget: z.number().nonnegative().optional(),
      currency: z.string().max(10).optional(),
      themeVibe: z.string().max(500).optional(),
      dietaryNeeds: z.string().max(500).optional(),
      accessibilityNeeds: z.string().max(500).optional(),
    })
    .optional(),
});
export type ChatStreamRequest = z.infer<typeof ChatStreamRequestSchema>;

export const BudgetItemSchema = z.object({
  id: z.string(),
  category: BudgetCategoryEnum,
  categoryLabel: z.string(),
  allocatedAmount: z.number().nonnegative(),
  spentAmount: z.number().nonnegative().default(0),
  percentageOfBudget: z.number().nonnegative(),
  notes: z.string().optional(),
  suggestedVendorsOrTips: z.string().optional(),
});

export const TimelineTaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string(),
  category: z.string(),
  timeframe: z.string(),
  dueDate: z.string(),
  relativeDaysBefore: z.number().int(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['pending', 'in_progress', 'completed']),
  assignedTo: z.string().optional(),
});

export const VendorSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  category: BudgetCategoryEnum,
  categoryLabel: z.string(),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  quotedPrice: z.number().nonnegative(),
  status: z.enum(['Shortlisted', 'Booked', 'Paid']),
  notes: z.string().optional(),
  aiSuggestedQuestions: z.array(z.string()).optional(),
});

export const IdeaItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string(),
  tags: z.array(z.string()),
  isPinned: z.boolean().optional(),
});

export const EventIdeasSchema = z.object({
  themes: z.array(IdeaItemSchema),
  decor: z.array(IdeaItemSchema),
  menu: z.array(IdeaItemSchema),
  activities: z.array(IdeaItemSchema),
  returnGifts: z.array(IdeaItemSchema),
});

export const EventDetailsSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  eventType: EventTypeEnum,
  date: z.string(),
  guestCount: z.number().int().positive(),
  city: z.string(),
  totalBudget: z.number().nonnegative(),
  currency: CurrencyCodeEnum,
  themeVibe: z.string(),
  culturalPreferences: z.string().optional(),
  dietaryNeeds: z.string().optional(),
  accessibilityNeeds: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const FullEventPlanSchema = z.object({
  details: EventDetailsSchema,
  budget: z.array(BudgetItemSchema),
  timeline: z.array(TimelineTaskSchema),
  vendors: z.array(VendorSchema),
  ideas: EventIdeasSchema,
});

