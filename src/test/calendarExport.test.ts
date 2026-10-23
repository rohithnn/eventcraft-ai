import { describe, it, expect } from 'vitest';
import { generateIcsString } from '../services/pdfExport';
import { SAMPLE_WEDDING } from '../constants/samples';

describe('calendarExport', () => {
  it('generates a valid RFC 5545 iCalendar string from an event plan', () => {
    const ics = generateIcsString(SAMPLE_WEDDING);

    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('PRODID:-//EventCraft AI//Event Timeline Generator//EN');
    expect(ics).toContain('END:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('SUMMARY:[EventCraft]');
    expect(ics).toContain('DTSTART;VALUE=DATE:');
    expect(ics).toContain('END:VEVENT');
  });

  it('includes every timeline task as a distinct VEVENT', () => {
    const ics = generateIcsString(SAMPLE_WEDDING);
    const eventCount = (ics.match(/BEGIN:VEVENT/g) || []).length;
    expect(eventCount).toBe(SAMPLE_WEDDING.timeline.length);
  });
});
