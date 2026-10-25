import { describe, expect, it } from 'vitest';
import {
  DailyTimeEntryLimitError,
  DefaultTimeEntryService,
} from '@/application/time-entries/time-entry-service';
import type {
  NewTimeEntry,
  TimeEntryRepository,
} from '@/application/time-entries/time-entry-repository';
import type { TimePeriodRepository } from '@/application/time-periods/time-period-repository';
import { ClosedTimePeriodError } from '@/application/time-periods/time-period-service';
import type { TimeEntry } from '@/domain/time-entry';

function createTimeEntry(id: string, recordedAt: string): TimeEntry {
  return {
    id,
    userId: 'user-1',
    recordedAt: new Date(recordedAt),
    dayKey: '2026-05-15',
    monthKey: '2026-05',
    status: 'ACTIVE',
  };
}

class FakeTimeEntryRepository implements TimeEntryRepository {
  readonly createInputs: NewTimeEntry[] = [];
  readonly findInputs: { dayKey: string; userId: string }[] = [];
  readonly findMonthInputs: { monthKey: string; userId: string }[] = [];
  private readonly entries: TimeEntry[];
  private readonly createdEntry: TimeEntry;

  constructor(
    entries: TimeEntry[],
    createdEntry = createTimeEntry('new-entry', '2026-05-15T12:00:00Z'),
  ) {
    this.entries = entries;
    this.createdEntry = createdEntry;
  }

  create(entry: NewTimeEntry) {
    this.createInputs.push(entry);
    return Promise.resolve(this.createdEntry);
  }

  findById(id: string) {
    return Promise.resolve(this.entries.find((entry) => entry.id === id) ?? null);
  }

  findByUserAndDay(userId: string, dayKey: string) {
    this.findInputs.push({ dayKey, userId });
    return Promise.resolve([...this.entries]);
  }

  findByUserAndMonth(userId: string, monthKey: string) {
    this.findMonthInputs.push({ monthKey, userId });
    return Promise.resolve([...this.entries]);
  }
}

class FakeTimePeriodRepository implements TimePeriodRepository {
  closed = false;

  close() {
    return Promise.resolve();
  }

  find(monthKey: string) {
    return Promise.resolve({
      closedAt: this.closed ? new Date('2026-06-01T12:00:00.000Z') : null,
      closedById: this.closed ? 'admin-1' : null,
      monthKey,
      status: this.closed ? ('CLOSED' as const) : ('OPEN' as const),
    });
  }
}

function createService(repository: TimeEntryRepository, periods = new FakeTimePeriodRepository()) {
  return new DefaultTimeEntryService(repository, periods);
}

describe('DefaultTimeEntryService', () => {
  const now = new Date('2026-05-15T15:00:00.000Z');

  it('returns the current business day in chronological order', async () => {
    const repository = new FakeTimeEntryRepository([
      createTimeEntry('second', '2026-05-15T11:00:00.000Z'),
      createTimeEntry('first', '2026-05-15T09:00:00.000Z'),
    ]);
    const service = createService(repository);

    const result = await service.findToday('user-1', now);

    expect(repository.findInputs).toEqual([{ dayKey: '2026-05-15', userId: 'user-1' }]);
    expect(result.entries.map(({ id }) => id)).toEqual(['first', 'second']);
    expect(result.canRegister).toBe(true);
  });

  it('persists query keys and returns the new entry in chronological order', async () => {
    const repository = new FakeTimeEntryRepository(
      [createTimeEntry('later', '2026-05-15T13:00:00.000Z')],
      createTimeEntry('new-entry', '2026-05-15T12:00:00.000Z'),
    );
    const service = createService(repository);

    const result = await service.register('user-1', now);

    expect(repository.createInputs).toEqual([
      { dayKey: '2026-05-15', monthKey: '2026-05', userId: 'user-1' },
    ]);
    expect(result.entries.map(({ id }) => id)).toEqual(['new-entry', 'later']);
  });

  it('marks a full day unavailable and prevents another write', async () => {
    const entries = Array.from({ length: 8 }, (_, index) =>
      createTimeEntry(
        `entry-${String(index)}`,
        `2026-05-15T${String(index + 8).padStart(2, '0')}:00:00.000Z`,
      ),
    );
    const repository = new FakeTimeEntryRepository(entries);
    const service = createService(repository);

    await expect(service.findToday('user-1', now)).resolves.toMatchObject({
      canRegister: false,
    });
    await expect(service.register('user-1', now)).rejects.toBeInstanceOf(DailyTimeEntryLimitError);
    expect(repository.createInputs).toHaveLength(0);
  });

  it('ignores removed entries when reading a day and enforcing its limit', async () => {
    const removedEntry = {
      ...createTimeEntry('removed', '2026-05-15T08:00:00.000Z'),
      status: 'REMOVED' as const,
    };
    const activeEntries = Array.from({ length: 7 }, (_, index) =>
      createTimeEntry(
        `entry-${String(index)}`,
        `2026-05-15T${String(index + 9).padStart(2, '0')}:00:00.000Z`,
      ),
    );
    const repository = new FakeTimeEntryRepository([removedEntry, ...activeEntries]);
    const service = createService(repository);

    await expect(service.findToday('user-1', now)).resolves.toMatchObject({
      canRegister: true,
      entries: activeEntries,
    });
    await expect(service.register('user-1', now)).resolves.toMatchObject({ canRegister: false });
  });

  it('builds every day of a leap month and associates entries with their business day', async () => {
    const repository = new FakeTimeEntryRepository([
      {
        ...createTimeEntry('afternoon-exit', '2028-02-01T20:00:00.000Z'),
        dayKey: '2028-02-01',
        monthKey: '2028-02',
      },
      {
        ...createTimeEntry('morning-entry', '2028-02-01T11:00:00.000Z'),
        dayKey: '2028-02-01',
        monthKey: '2028-02',
      },
      {
        ...createTimeEntry('morning-exit', '2028-02-01T15:00:00.000Z'),
        dayKey: '2028-02-01',
        monthKey: '2028-02',
      },
      {
        ...createTimeEntry('afternoon-entry', '2028-02-01T16:00:00.000Z'),
        dayKey: '2028-02-01',
        monthKey: '2028-02',
      },
    ]);
    const service = createService(repository);

    const result = await service.findMonth(
      'user-1',
      '2028-02',
      new Date('2028-02-15T15:00:00.000Z'),
    );

    expect(repository.findMonthInputs).toEqual([{ monthKey: '2028-02', userId: 'user-1' }]);
    expect(result.days).toHaveLength(29);
    expect(result.days[0]).toMatchObject({
      dayKey: '2028-02-01',
      isFuture: false,
      workedMilliseconds: 8 * 60 * 60 * 1000,
    });
    expect(result.days[0]?.entries.map(({ id }) => id)).toEqual([
      'morning-entry',
      'morning-exit',
      'afternoon-entry',
      'afternoon-exit',
    ]);
    expect(result.days[28]).toMatchObject({
      dayKey: '2028-02-29',
      entries: [],
      isFuture: true,
      workedMilliseconds: 0,
    });
  });

  it('ignores an unmatched final entry when calculating worked time', async () => {
    const repository = new FakeTimeEntryRepository([
      createTimeEntry('third', '2026-05-15T16:00:00.000Z'),
      createTimeEntry('first', '2026-05-15T11:00:00.000Z'),
      createTimeEntry('second', '2026-05-15T15:00:00.000Z'),
    ]);
    const service = createService(repository);

    const result = await service.findMonth('user-1', '2026-05', now);

    expect(result.days[14]).toMatchObject({
      dayKey: '2026-05-15',
      workedMilliseconds: 4 * 60 * 60 * 1000,
    });
  });

  it('prevents writes in a closed period', async () => {
    const repository = new FakeTimeEntryRepository([]);
    const periods = new FakeTimePeriodRepository();
    periods.closed = true;
    const service = createService(repository, periods);

    await expect(service.register('user-1', now)).rejects.toBeInstanceOf(ClosedTimePeriodError);
    expect(repository.createInputs).toHaveLength(0);
  });
});
