import { FullEventPlan } from '../types/event';
import { SAMPLE_WEDDING, SAMPLE_BIRTHDAY, SAMPLE_COMMUNITY } from '../constants/samples';

export const STORAGE_KEYS = {
  EVENTS_KEY: 'eventcraft_v1_events',
  ACTIVE_ID_KEY: 'eventcraft_v1_active_id',
  THEME_KEY: 'eventcraft_v1_theme',
};

const DEFAULT_EVENTS: FullEventPlan[] = [
  SAMPLE_WEDDING,
  SAMPLE_BIRTHDAY,
  SAMPLE_COMMUNITY,
];

/**
 * Safely parses JSON from localStorage with fallback
 */
export function safeJsonParse<T>(jsonString: string | null, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed && typeof parsed === 'object') {
      return parsed as T;
    }
    return fallback;
  } catch {
    console.warn('Storage parse failed, falling back to default data');
    return fallback;
  }
}

/**
 * Loads all stored events or initializes with prebuilt sample events
 */
export function loadAllEvents(): FullEventPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS_KEY);
    const parsed = safeJsonParse<FullEventPlan[]>(raw, []);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.details?.id) {
      return parsed;
    }
    // First time or corrupted: seed with samples
    saveAllEvents(DEFAULT_EVENTS);
    return DEFAULT_EVENTS;
  } catch {
    return DEFAULT_EVENTS;
  }
}

/**
 * Saves all events array to localStorage
 */
export function saveAllEvents(events: FullEventPlan[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS_KEY, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to save events to localStorage:', err);
  }
}

/**
 * Saves or updates a single event plan
 */
export function saveEvent(event: FullEventPlan): void {
  const events = loadAllEvents();
  const existingIndex = events.findIndex((e) => e.details.id === event.details.id);
  const updatedEvent = {
    ...event,
    details: {
      ...event.details,
      updatedAt: new Date().toISOString(),
    },
  };

  if (existingIndex >= 0) {
    events[existingIndex] = updatedEvent;
  } else {
    events.unshift(updatedEvent);
  }
  saveAllEvents(events);
}

/**
 * Retrieves the currently active event ID from storage
 */
export function loadActiveEventId(): string {
  try {
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ID_KEY);
    if (activeId) return activeId;
    return SAMPLE_WEDDING.details.id;
  } catch {
    return SAMPLE_WEDDING.details.id;
  }
}

/**
 * Sets the currently active event ID in storage
 */
export function saveActiveEventId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ID_KEY, id);
  } catch (err) {
    console.error('Failed to save active event ID:', err);
  }
}

/**
 * Deletes an event by ID
 */
export function deleteEvent(id: string): FullEventPlan[] {
  const events = loadAllEvents();
  const filtered = events.filter((e) => e.details.id !== id);
  const remaining = filtered.length > 0 ? filtered : DEFAULT_EVENTS;
  saveAllEvents(remaining);
  return remaining;
}

/**
 * Resets storage back to default samples
 */
export function resetStorage(): FullEventPlan[] {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS_KEY, JSON.stringify(DEFAULT_EVENTS));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ID_KEY, DEFAULT_EVENTS[0].details.id);
    return DEFAULT_EVENTS;
  } catch {
    return DEFAULT_EVENTS;
  }
}
