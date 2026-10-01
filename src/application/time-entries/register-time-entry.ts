import { getBusinessDateKeys } from '@/application/time-entries/business-time';
import type { TimeEntryRepository } from '@/application/time-entries/time-entry-repository';

export const MAX_DAILY_TIME_ENTRIES = 8;

interface RegisterTimeEntryInput {
  now: Date;
  userId: string;
}

export class DailyTimeEntryLimitError extends Error {
  constructor() {
    super('Daily time entry limit reached.');
    this.name = 'DailyTimeEntryLimitError';
  }
}

export async function registerTimeEntry(
  { now, userId }: RegisterTimeEntryInput,
  repository: TimeEntryRepository,
) {
  const { dayKey, monthKey } = getBusinessDateKeys(now);
  const currentEntries = await repository.findByUserAndDay(userId, dayKey);

  if (currentEntries.length >= MAX_DAILY_TIME_ENTRIES) {
    throw new DailyTimeEntryLimitError();
  }

  return repository.create({ dayKey, monthKey, userId });
}
