import { describe, expect, it } from 'vitest';
import { formatBusinessTimeInput, parseBusinessDayAndTime } from '@/ui/formatters/business-time';

describe('business time input', () => {
  it('combines a business day and time into an absolute timestamp', () => {
    const timestamp = new Date('2026-10-12T13:30:00.000Z');

    expect(formatBusinessTimeInput(timestamp)).toBe('10:30');
    expect(parseBusinessDayAndTime('2026-10-12', '10:30')).toEqual(timestamp);
  });
});
