import { describe, expect, it } from 'vitest';
import {
  DailyTimeEntryLimitError,
  DefaultTimeEntryService,
} from '@/application/time-entries/time-entry-service';
import type {
  NewTimeEntry,
  TimeEntryRepository,
} from '@/application/time-entries/time-entry-repository';
import type { TimeEntry } from '@/domain/time-entry';

function createTimeEntry(id: string, recordedAt: string): TimeEntry {
  return {
    id,
    userId: 'user-1',
    recordedAt: new Date(recordedAt),
    dayKey: '2026-05-15',
    monthKey: '2026-05',
  };
}

class FakeTimeEntryRepository implements TimeEntryRepository {
  readonly createInputs: NewTimeEntry[] = [];
  readonly findInputs: { dayKey: string; userId: string }[] = [];
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

  findByUserAndDay(userId: string, dayKey: string) {
    this.findInputs.push({ dayKey, userId });
    return Promise.resolve([...this.entries]);
  }

  findByUserAndMonth() {
    return Promise.resolve([...this.entries]);
  }
}

describe('DefaultTimeEntryService', () => {
  const now = new Date('2026-05-15T15:00:00.000Z');

  it('returns the current business day in chronological order', async () => {
    const repository = new FakeTimeEntryRepository([
      createTimeEntry('second', '2026-05-15T11:00:00.000Z'),
      createTimeEntry('first', '2026-05-15T09:00:00.000Z'),
    ]);
    const service = new DefaultTimeEntryService(repository);

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
    const service = new DefaultTimeEntryService(repository);

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
    const service = new DefaultTimeEntryService(repository);

    await expect(service.findToday('user-1', now)).resolves.toMatchObject({
      canRegister: false,
    });
    await expect(service.register('user-1', now)).rejects.toBeInstanceOf(DailyTimeEntryLimitError);
    expect(repository.createInputs).toHaveLength(0);
  });
});
