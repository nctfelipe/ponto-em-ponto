import { getBusinessDateKeys } from '@/application/time-entries/business-time';
import type { TimeEntryRepository } from '@/application/time-entries/time-entry-repository';
import type { TimeEntry } from '@/domain/time-entry';

export const MAX_DAILY_TIME_ENTRIES = 8;

export interface DailyTimeEntries {
  canRegister: boolean;
  date: Date;
  entries: TimeEntry[];
}

export class DailyTimeEntryLimitError extends Error {
  constructor() {
    super('Daily time entry limit reached.');
    this.name = 'DailyTimeEntryLimitError';
  }
}

function createDailyTimeEntries(date: Date, entries: TimeEntry[]): DailyTimeEntries {
  const sortedEntries = [...entries].sort(
    (left, right) => left.recordedAt.getTime() - right.recordedAt.getTime(),
  );

  return {
    canRegister: sortedEntries.length < MAX_DAILY_TIME_ENTRIES,
    date,
    entries: sortedEntries,
  };
}

export interface TimeEntryService {
  findToday(userId: string, now: Date): Promise<DailyTimeEntries>;
  register(userId: string, now: Date): Promise<DailyTimeEntries>;
}

export class DefaultTimeEntryService implements TimeEntryService {
  private readonly repository: TimeEntryRepository;

  constructor(repository: TimeEntryRepository) {
    this.repository = repository;
  }

  async findToday(userId: string, now: Date) {
    const { dayKey } = getBusinessDateKeys(now);
    const entries = await this.repository.findByUserAndDay(userId, dayKey);
    return createDailyTimeEntries(now, entries);
  }

  async register(userId: string, now: Date) {
    const { dayKey, monthKey } = getBusinessDateKeys(now);
    const currentEntries = await this.repository.findByUserAndDay(userId, dayKey);

    if (currentEntries.length >= MAX_DAILY_TIME_ENTRIES) {
      throw new DailyTimeEntryLimitError();
    }

    const entry = await this.repository.create({ dayKey, monthKey, userId });
    return createDailyTimeEntries(now, [...currentEntries, entry]);
  }
}
