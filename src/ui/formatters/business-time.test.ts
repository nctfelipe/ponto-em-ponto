import { describe, expect, it } from 'vitest';
import {
  formatBusinessDateTimeInput,
  parseBusinessDateTimeInput,
} from '@/ui/formatters/business-time';

describe('business date-time input', () => {
  it('converts between the business timezone and an absolute timestamp', () => {
    const timestamp = new Date('2026-10-12T13:30:00.000Z');

    expect(formatBusinessDateTimeInput(timestamp)).toBe('2026-10-12T10:30');
    expect(parseBusinessDateTimeInput('2026-10-12T10:30')).toEqual(timestamp);
  });
});
