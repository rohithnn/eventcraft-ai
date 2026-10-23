import { describe, it, expect, beforeEach } from 'vitest';
import {
  safeJsonParse,
  loadAllEvents,
  saveEvent,
  saveActiveEventId,
  loadActiveEventId,
  deleteEvent,
  resetStorage,
  STORAGE_KEYS,
} from '../services/storageService';
import { SAMPLE_WEDDING } from '../constants/samples';
import { FullEventPlan } from '../types/event';

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('safely parses valid JSON and returns fallback on corrupt JSON', () => {
    expect(safeJsonParse('{"valid": 123}', { valid: 0 })).toEqual({ valid: 123 });
    expect(safeJsonParse('{invalid-json', { valid: 0 })).toEqual({ valid: 0 });
    expect(safeJsonParse(null, { valid: 0 })).toEqual({ valid: 0 });
  });

  it('loads sample events when localStorage is empty', () => {
    const events = loadAllEvents();
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].details.title).toBeTruthy();
  });

  it('recovers with sample events when localStorage is corrupted with invalid data', () => {
    localStorage.setItem(STORAGE_KEYS.EVENTS_KEY, 'corrupted{[[not-valid-json');
    const events = loadAllEvents();
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].details.id).toBeTruthy();
  });

  it('saves and updates a single event plan correctly', () => {
    const customEvent: FullEventPlan = {
      ...SAMPLE_WEDDING,
      details: {
        ...SAMPLE_WEDDING.details,
        id: 'test-event-999',
        title: 'Custom Test Gala',
      },
    };

    saveEvent(customEvent);
    const events = loadAllEvents();
    const found = events.find((e) => e.details.id === 'test-event-999');
    expect(found).toBeDefined();
    expect(found?.details.title).toBe('Custom Test Gala');
  });

  it('tracks active event ID persistence', () => {
    saveActiveEventId('test-event-123');
    expect(loadActiveEventId()).toBe('test-event-123');
  });

  it('deletes an event and updates storage', () => {
    const customEvent: FullEventPlan = {
      ...SAMPLE_WEDDING,
      details: {
        ...SAMPLE_WEDDING.details,
        id: 'to-delete-01',
        title: 'Delete Me Event',
      },
    };
    saveEvent(customEvent);
    expect(loadAllEvents().some((e) => e.details.id === 'to-delete-01')).toBe(true);

    deleteEvent('to-delete-01');
    expect(loadAllEvents().some((e) => e.details.id === 'to-delete-01')).toBe(false);
  });

  it('resets storage back to default samples', () => {
    localStorage.setItem(STORAGE_KEYS.EVENTS_KEY, '[]');
    const samples = resetStorage();
    expect(samples.length).toBeGreaterThan(0);
    expect(loadAllEvents().length).toBeGreaterThan(0);
  });
});
