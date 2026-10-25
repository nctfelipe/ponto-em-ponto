import { describe, expect, it } from 'vitest';
import type { MonthlyTimeEntryDay } from '@/application/time-entries/time-entry-service';
import type { TimeEntryCorrection } from '@/domain/time-entry-correction';
import { getDayStatus } from '@/ui/time-entry-history/day-status';

const day: MonthlyTimeEntryDay = {
  dayKey: '2026-10-19',
  entries: [],
  isFuture: false,
  workedMilliseconds: 0,
};

function correction(
  status: TimeEntryCorrection['status'],
  requestedAt = new Date('2026-10-19T12:00:00.000Z'),
): TimeEntryCorrection {
  return {
    dayKey: day.dayKey,
    decidedAt: status === 'PENDING' ? null : requestedAt,
    decidedById: status === 'PENDING' ? null : 'admin-1',
    id: `${status}-${requestedAt.toISOString()}`,
    monthKey: '2026-10',
    previousEntries: [],
    proposedEntries: [],
    requestedAt,
    requestedById: 'user-1',
    status,
    userId: 'user-1',
  };
}

describe('getDayStatus', () => {
  it('returns no status for a consistent day without corrections', () => {
    expect(getDayStatus(day, [])).toBeNull();
  });

  it('prioritizes an inconsistent effective state', () => {
    const inconsistentDay = {
      ...day,
      entries: [
        {
          dayKey: day.dayKey,
          id: 'entry-1',
          monthKey: '2026-10',
          recordedAt: new Date('2026-10-19T11:00:00.000Z'),
          status: 'ACTIVE' as const,
          userId: 'user-1',
        },
      ],
    };

    expect(getDayStatus(inconsistentDay, [correction('PENDING')])).toBe('INCONSISTENT');
  });

  it('prioritizes a pending correction over previous decisions', () => {
    expect(getDayStatus(day, [correction('APPROVED'), correction('PENDING')])).toBe('PENDING');
  });

  it('uses the most recent correction decision', () => {
    expect(
      getDayStatus(day, [
        correction('REJECTED', new Date('2026-10-18T12:00:00.000Z')),
        correction('APPROVED', new Date('2026-10-19T12:00:00.000Z')),
      ]),
    ).toBe('ADJUSTED');
  });
});
