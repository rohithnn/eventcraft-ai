import { WizardInputData, AIGeneratePlanResponseSchema, AIGeneratePlanResponse } from '../schemas/eventSchema';
import { EventDetails, FullEventPlan, BudgetItem, TimelineTask, Vendor, EventIdeas, BudgetCategory } from '../types/event';
import { calculateDueDate } from '../utils/dateUtils';
import { BUDGET_CATEGORIES, DEFAULT_VENDOR_QUESTIONS } from '../constants/defaults';
import { sanitizeUserInput } from './sanitizer';

// In-memory response cache based on input signature
const planCache = new Map<string, FullEventPlan>();
const questionsCache = new Map<string, string[]>();

// Cooldown tracker: minimum ms between generative calls to prevent rapid spamming
let lastCallTimestamp = 0;
const MIN_COOLDOWN_MS = 1500;

/**
 * Creates a unique deterministic hash key for wizard inputs
 */
function hashInput(data: WizardInputData): string {
  return `${data.eventType}|${data.title.toLowerCase()}|${data.guestCount}|${data.totalBudget}|${data.city.toLowerCase()}|${data.currency}|${data.themeVibe.toLowerCase()}`;
}

/**
 * Helper to execute fetch with exponential backoff for transient 429/500 errors
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = 2,
  delay: number = 1000
): Promise<Response> {
  try {
    const res = await fetch(url, options);
    if ((res.status === 429 || res.status >= 500) && retries > 0) {
      console.warn(`Encountered status ${res.status}. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    return res;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw err;
    }
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw err;
  }
}

/**
 * Enforces client-side cooldown to avoid spamming
 */
async function checkCooldown(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastCallTimestamp;
  if (elapsed < MIN_COOLDOWN_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_COOLDOWN_MS - elapsed));
  }
  lastCallTimestamp = Date.now();
}

/**
 * Calls backend to generate full structured event plan
 */
export async function generatePlanFromGemini(
  input: WizardInputData,
  signal?: AbortSignal
): Promise<FullEventPlan> {
  const cacheKey = hashInput(input);
  if (planCache.has(cacheKey)) {
    return JSON.parse(JSON.stringify(planCache.get(cacheKey)!));
  }

  await checkCooldown();

  const response = await fetchWithRetry(
    '/api/plan/generate',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal,
    },
    2,
    1000
  );

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('AI rate limit reached. Please wait a moment before trying again.');
    }
    throw new Error(`Plan generation failed with status: ${response.status}`);
  }

  const json = await response.json();
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Failed to generate event plan from AI.');
  }

  // Validate AI structured output against Zod schema
  const parsed = AIGeneratePlanResponseSchema.safeParse(json.data);
  let aiData: AIGeneratePlanResponse;

  if (!parsed.success) {
    console.warn('AI structured output schema validation warnings:', parsed.error.issues);
    // Gracefully normalize into valid structure if schema mismatch
    aiData = {
      overview: json.data?.overview || '',
      budget: Array.isArray(json.data?.budget) ? json.data.budget : [],
      timeline: Array.isArray(json.data?.timeline) ? json.data.timeline : [],
      ideas: json.data?.ideas || {
        themes: [],
        decor: [],
        menu: [],
        activities: [],
        returnGifts: [],
      },
    };
  } else {
    aiData = parsed.data;
  }

  const eventId = `event-${Date.now()}`;
  const nowIso = new Date().toISOString();

  const details: EventDetails = {
    id: eventId,
    title: sanitizeUserInput(input.title, 100),
    eventType: input.eventType,
    date: input.date,
    guestCount: input.guestCount,
    city: sanitizeUserInput(input.city, 100),
    totalBudget: input.totalBudget,
    currency: input.currency,
    themeVibe: sanitizeUserInput(input.themeVibe, 300),
    culturalPreferences: sanitizeUserInput(input.culturalPreferences, 300),
    dietaryNeeds: sanitizeUserInput(input.dietaryNeeds, 300),
    accessibilityNeeds: sanitizeUserInput(input.accessibilityNeeds, 300),
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  // Convert raw budget items to FullEventPlan BudgetItem
  const budget: BudgetItem[] = aiData.budget.map((b, idx) => ({
    id: `b-${eventId}-${idx + 1}`,
    category: b.category as BudgetCategory,
    categoryLabel: b.categoryLabel || b.category,
    allocatedAmount: Math.round(b.allocatedAmount),
    spentAmount: 0,
    percentageOfBudget: b.percentageOfBudget || 0,
    notes: b.notes ? sanitizeUserInput(b.notes, 200) : '',
    suggestedVendorsOrTips: b.suggestedVendorsOrTips ? sanitizeUserInput(b.suggestedVendorsOrTips, 200) : '',
  }));

  // Convert raw timeline items with backward-planned dates
  const timeline: TimelineTask[] = aiData.timeline.map((t, idx) => {
    const relDays = typeof t.relativeDaysBefore === 'number' ? t.relativeDaysBefore : 30;
    const dueDate = calculateDueDate(input.date, relDays);
    return {
      id: `t-${eventId}-${idx + 1}`,
      title: sanitizeUserInput(t.title, 150),
      description: sanitizeUserInput(t.description, 300),
      category: (t.category as BudgetCategory) || 'general',
      timeframe: sanitizeUserInput(t.timeframe, 50),
      relativeDaysBefore: relDays,
      dueDate,
      status: 'pending',
      priority: t.priority || 'medium',
    };
  });

  // Initial vendors list
  const initialVendors: Vendor[] = BUDGET_CATEGORIES.slice(0, 3).map((cat, idx) => ({
    id: `v-${eventId}-${idx + 1}`,
    name: `${cat.label} Option`,
    category: cat.key,
    categoryLabel: cat.label,
    quotedPrice: Math.round(input.totalBudget * cat.defaultShare),
    status: 'Shortlisted',
    notes: 'Awaiting portfolio review & quote comparison.',
    aiSuggestedQuestions: DEFAULT_VENDOR_QUESTIONS[cat.key] || [],
  }));

  const ideas: EventIdeas = {
    themes: (aiData.ideas.themes || []).map((th, i) => ({
      id: `th-${eventId}-${i + 1}`,
      title: sanitizeUserInput(th.title, 80),
      description: sanitizeUserInput(th.description, 400),
      tags: th.tags || [],
      isPinned: i === 0,
    })),
    decor: (aiData.ideas.decor || []).map((dc, i) => ({
      id: `dc-${eventId}-${i + 1}`,
      title: sanitizeUserInput(dc.title, 80),
      description: sanitizeUserInput(dc.description, 400),
      tags: dc.tags || [],
      isPinned: i === 0,
    })),
    menu: (aiData.ideas.menu || []).map((mn, i) => ({
      id: `mn-${eventId}-${i + 1}`,
      title: sanitizeUserInput(mn.title, 80),
      description: sanitizeUserInput(mn.description, 400),
      tags: mn.tags || [],
      isPinned: i === 0,
    })),
    activities: (aiData.ideas.activities || []).map((ac, i) => ({
      id: `ac-${eventId}-${i + 1}`,
      title: sanitizeUserInput(ac.title, 80),
      description: sanitizeUserInput(ac.description, 400),
      tags: ac.tags || [],
      isPinned: i === 0,
    })),
    returnGifts: (aiData.ideas.returnGifts || []).map((rg, i) => ({
      id: `rg-${eventId}-${i + 1}`,
      title: sanitizeUserInput(rg.title, 80),
      description: sanitizeUserInput(rg.description, 400),
      tags: rg.tags || [],
      isPinned: i === 0,
    })),
  };

  const fullPlan: FullEventPlan = {
    details,
    budget,
    timeline,
    vendors: initialVendors,
    ideas,
  };

  planCache.set(cacheKey, fullPlan);
  return fullPlan;
}

/**
 * Calls backend to fetch tailored vendor questions
 */
export async function getVendorQuestionsFromGemini(
  category: BudgetCategory,
  eventType: string,
  guestCount: number,
  city: string,
  signal?: AbortSignal
): Promise<string[]> {
  const cacheKey = `${category}|${eventType}|${guestCount}|${city}`;
  if (questionsCache.has(cacheKey)) {
    return questionsCache.get(cacheKey)!;
  }

  try {
    await checkCooldown();
    const res = await fetchWithRetry(
      '/api/vendor/questions',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, eventType, guestCount, city }),
        signal,
      },
      1,
      800
    );

    if (res.ok) {
      const json = await res.json();
      if (json.questions && Array.isArray(json.questions)) {
        questionsCache.set(cacheKey, json.questions);
        return json.questions;
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') throw err;
  }

  return DEFAULT_VENDOR_QUESTIONS[category] || DEFAULT_VENDOR_QUESTIONS.venue;
}

/**
 * Regenerates ideas using Gemini with custom user prompt
 */
export async function regenerateIdeasFromGemini(
  eventDetails: EventDetails,
  userPrompt?: string,
  signal?: AbortSignal
): Promise<EventIdeas> {
  await checkCooldown();
  const res = await fetchWithRetry(
    '/api/ideas/generate',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventDetails, userPrompt }),
      signal,
    },
    1,
    1000
  );

  if (!res.ok) {
    throw new Error('Failed to generate fresh ideas');
  }

  const json = await res.json();
  const rawIdeas = json.ideas || {};

  interface RawIdeaItem {
    title?: string;
    description?: string;
    tags?: string[];
  }

  const mapItems = (items: RawIdeaItem[] | undefined, prefix: string) =>
    (items || []).map((i: RawIdeaItem, idx: number) => ({
      id: `${prefix}-new-${Date.now()}-${idx}`,
      title: sanitizeUserInput(i.title || '', 80),
      description: sanitizeUserInput(i.description || '', 400),
      tags: i.tags || [],
      isPinned: false,
    }));

  return {
    themes: mapItems(rawIdeas.themes, 'th'),
    decor: mapItems(rawIdeas.decor, 'dc'),
    menu: mapItems(rawIdeas.menu, 'mn'),
    activities: mapItems(rawIdeas.activities, 'ac'),
    returnGifts: mapItems(rawIdeas.returnGifts, 'rg'),
  };
}

/**
 * Streams chat responses from the backend SSE endpoint
 */
export async function streamChatResponse(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  eventContext: EventDetails,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (err: string) => void,
  signal?: AbortSignal
): Promise<void> {
  try {
    const res = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, eventContext }),
      signal,
    });

    if (!res.ok) {
      throw new Error(`Chat connection failed (${res.status})`);
    }

    const reader = res.body?.getReader();
    if (!reader) {
      throw new Error('Streaming response body unavailable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const dataStr = trimmed.slice(6);
          if (dataStr === '[DONE]') {
            onDone();
            return;
          }
          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.text) {
              onChunk(parsed.text);
            }
          } catch {
            // raw text chunk
            onChunk(dataStr);
          }
        }
      }
    }
    onDone();
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.name === 'AbortError') return;
      onError(err.message || 'Error communicating with assistant');
    } else {
      onError('Error communicating with assistant');
    }
  }
}
