import type { TimeEntry } from '@/domain/time-entry';

export interface NewTimeEntry {
  userId: string;
  dayKey: string;
  monthKey: string;
}

export interface TimeEntryRepository {
  create(entry: NewTimeEntry): Promise<TimeEntry>;
  findByUserAndDay(userId: string, dayKey: string): Promise<TimeEntry[]>;
}

export class TimeEntryRepositoryError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'TimeEntryRepositoryError';
  }
}
