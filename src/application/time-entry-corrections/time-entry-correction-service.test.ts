import { describe, expect, it } from 'vitest';
import type { TimeEntryRepository } from '@/application/time-entries/time-entry-repository';
import {
  ClosedTimePeriodError,
  InvalidTimeEntryCorrectionError,
  OutdatedTimeEntryCorrectionError,
  PendingTimeEntryCorrectionError,
  TimeEntryCorrectionService,
} from '@/application/time-entry-corrections/time-entry-correction-service';
import type {
  NewTimeEntryCorrection,
  TimeEntryCorrectionRepository,
} from '@/application/time-entry-corrections/time-entry-correction-repository';
import type { TimePeriodRepository } from '@/application/time-periods/time-period-repository';
import type { TimeEntryCorrection } from '@/domain/time-entry-correction';
import type { TimeEntry } from '@/domain/time-entry';

const entry: TimeEntry = {
  dayKey: '2026-10-19',
  id: 'entry-1',
  monthKey: '2026-10',
  recordedAt: new Date('2026-10-19T11:00:00.000Z'),
  status: 'ACTIVE',
  userId: 'user-1',
};

class FakeTimeEntryRepository implements TimeEntryRepository {
  entries = [entry];
  create() {
    return Promise.resolve(entry);
  }
  findById(id: string) {
    return Promise.resolve(this.entries.find((item) => item.id === id) ?? null);
  }
  findByUserAndDay(userId: string, dayKey: string) {
    return Promise.resolve(
      this.entries.filter((item) => item.userId === userId && item.dayKey === dayKey),
    );
  }
  findByUserAndMonth() {
    return Promise.resolve(this.entries);
  }
}

class FakeCorrectionRepository implements TimeEntryCorrectionRepository {
  applied: NewTimeEntryCorrection[] = [];
  created: NewTimeEntryCorrection[] = [];
  corrections: TimeEntryCorrection[] = [];
  decisions: { id: string; status: 'APPROVED' | 'REJECTED' }[] = [];

  apply(correction: NewTimeEntryCorrection) {
    this.applied.push(correction);
    return Promise.resolve();
  }
  create(correction: NewTimeEntryCorrection) {
    this.created.push(correction);
    return Promise.resolve();
  }
  decide(correction: TimeEntryCorrection, status: 'APPROVED' | 'REJECTED') {
    this.decisions.push({ id: correction.id, status });
    return Promise.resolve();
  }
  findById(id: string) {
    return Promise.resolve(this.corrections.find((item) => item.id === id) ?? null);
  }
  findByUserAndMonth() {
    return Promise.resolve(this.corrections);
  }
  findPendingByDay(userId: string, dayKey: string) {
    return Promise.resolve(
      this.corrections.find(
        (item) => item.userId === userId && item.dayKey === dayKey && item.status === 'PENDING',
      ) ?? null,
    );
  }
}

class FakePeriodRepository implements TimePeriodRepository {
  closed = false;
  isClosed() {
    return Promise.resolve(this.closed);
  }
}

function createService() {
  const corrections = new FakeCorrectionRepository();
  const entries = new FakeTimeEntryRepository();
  const periods = new FakePeriodRepository();
  return {
    corrections,
    entries,
    periods,
    service: new TimeEntryCorrectionService(corrections, periods, entries),
  };
}

function pendingCorrection(): TimeEntryCorrection {
  return {
    dayKey: entry.dayKey,
    decidedAt: null,
    decidedById: null,
    id: 'correction-1',
    monthKey: entry.monthKey,
    previousEntries: [{ recordedAt: entry.recordedAt, timeEntryId: entry.id }],
    proposedEntries: [{ recordedAt: new Date('2026-10-19T11:05:00.000Z'), timeEntryId: entry.id }],
    requestedAt: new Date('2026-10-19T12:00:00.000Z'),
    requestedById: entry.userId,
    status: 'PENDING',
    userId: entry.userId,
  };
}

describe('TimeEntryCorrectionService', () => {
  it('stores the current and proposed daily states in one correction', async () => {
    const { corrections, service } = createService();
    const proposed = new Date('2026-10-19T11:05:00.000Z');

    await service.request({
      dayKey: entry.dayKey,
      proposedEntries: [{ recordedAt: proposed, timeEntryId: entry.id }],
      requestedById: entry.userId,
      userId: entry.userId,
    });

    expect(corrections.created[0]).toMatchObject({
      previousEntries: [{ recordedAt: entry.recordedAt, timeEntryId: entry.id }],
      proposedEntries: [{ recordedAt: proposed, timeEntryId: entry.id }],
    });
  });

  it('prevents a second pending correction for the same day', async () => {
    const { corrections, service } = createService();
    corrections.corrections = [pendingCorrection()];

    await expect(
      service.request({
        dayKey: entry.dayKey,
        proposedEntries: [],
        requestedById: entry.userId,
        userId: entry.userId,
      }),
    ).rejects.toBeInstanceOf(PendingTimeEntryCorrectionError);
  });

  it('prevents proposals with more than eight entries', async () => {
    const { service } = createService();
    const proposedEntries = Array.from({ length: 9 }, (_, index) => ({
      recordedAt: new Date(`2026-10-19T${String(index + 8).padStart(2, '0')}:00:00.000-03:00`),
      timeEntryId: null,
    }));

    await expect(
      service.request({
        dayKey: entry.dayKey,
        proposedEntries,
        requestedById: entry.userId,
        userId: entry.userId,
      }),
    ).rejects.toBeInstanceOf(InvalidTimeEntryCorrectionError);
  });

  it('prevents corrections in a closed period', async () => {
    const { periods, service } = createService();
    periods.closed = true;

    await expect(
      service.request({
        dayKey: entry.dayKey,
        proposedEntries: [],
        requestedById: entry.userId,
        userId: entry.userId,
      }),
    ).rejects.toBeInstanceOf(ClosedTimePeriodError);
  });

  it('does not approve a correction based on an outdated daily state', async () => {
    const { corrections, entries, service } = createService();
    corrections.corrections = [pendingCorrection()];
    entries.entries = [{ ...entry, recordedAt: new Date('2026-10-19T11:01:00.000Z') }];

    await expect(service.decide('correction-1', 'APPROVED', 'admin-1')).rejects.toBeInstanceOf(
      OutdatedTimeEntryCorrectionError,
    );
    expect(corrections.decisions).toHaveLength(0);
  });
});
