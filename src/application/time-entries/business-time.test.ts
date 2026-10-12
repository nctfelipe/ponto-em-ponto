import { describe, expect, it } from 'vitest';
import { getBusinessDateKeys } from '@/application/time-entries/business-time';

describe('getBusinessDateKeys', () => {
  it('derives the business day across a UTC year boundary', () => {
    expect(getBusinessDateKeys(new Date('2026-01-01T02:30:00.000Z'))).toEqual({
      dayKey: '2025-12-31',
      monthKey: '2025-12',
    });

    expect(getBusinessDateKeys(new Date('2026-01-01T03:30:00.000Z'))).toEqual({
      dayKey: '2026-01-01',
      monthKey: '2026-01',
    });
  });
});
