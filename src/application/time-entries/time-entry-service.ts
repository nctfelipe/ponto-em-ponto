import { getBusinessDateKeys } from '@/application/time-entries/business-time';
import type { TimeEntryRepository } from '@/application/time-entries/time-entry-repository';
import type { TimeEntry } from '@/domain/time-entry';

export const MAX_DAILY_TIME_ENTRIES = 8;

export interface DailyTimeEntries {
  canRegister: boolean;
  date: Date;
  entries: TimeEntry[];
}

export interface MonthlyTimeEntryDay {
  dayKey: string;
  entries: TimeEntry[];
  isFuture: boolean;
  workedMilliseconds: number;
}

export interface MonthlyTimeEntries {
  days: MonthlyTimeEntryDay[];
  monthKey: string;
}

export class DailyTimeEntryLimitError extends Error {
  constructor() {
    super('Daily time entry limit reached.');
    this.name = 'DailyTimeEntryLimitError';
  }
}

function createDailyTimeEntries(date: Date, entries: TimeEntry[]): DailyTimeEntries {
  const sortedEntries = entries
    .filter((entry) => entry.status === 'ACTIVE')
    .sort((left, right) => left.recordedAt.getTime() - right.recordedAt.getTime());

  return {
    canRegister: sortedEntries.length < MAX_DAILY_TIME_ENTRIES,
    date,
    entries: sortedEntries,
  };
}

function calculateWorkedMilliseconds(entries: TimeEntry[]) {
  let total = 0;

  for (let index = 0; index + 1 < entries.length; index += 2) {
    const entry = entries[index];
    const exit = entries[index + 1];

    if (entry && exit) total += exit.recordedAt.getTime() - entry.recordedAt.getTime();
  }

  return total;
}

function createMonthlyTimeEntries(
  monthKey: string,
  entries: TimeEntry[],
  now: Date,
): MonthlyTimeEntries {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(monthKey);

  if (!match) throw new RangeError('Invalid month key.');

  const year = Number(match[1]);
  const month = Number(match[2]);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const { dayKey: currentDayKey } = getBusinessDateKeys(now);
  const entriesByDay = entries
    .filter((entry) => entry.status === 'ACTIVE')
    .reduce<Map<string, TimeEntry[]>>((groups, entry) => {
      const dailyEntries = groups.get(entry.dayKey) ?? [];
      dailyEntries.push(entry);
      groups.set(entry.dayKey, dailyEntries);
      return groups;
    }, new Map());

  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const dayKey = `${monthKey}-${String(index + 1).padStart(2, '0')}`;
    const dailyEntries = [...(entriesByDay.get(dayKey) ?? [])].sort(
      (left, right) => left.recordedAt.getTime() - right.recordedAt.getTime(),
    );

    return {
      dayKey,
      entries: dailyEntries,
      isFuture: dayKey > currentDayKey,
      workedMilliseconds: calculateWorkedMilliseconds(dailyEntries),
    };
  });

  return { days, monthKey };
}

export interface TimeEntryService {
  findMonth(userId: string, monthKey: string, now: Date): Promise<MonthlyTimeEntries>;
  findToday(userId: string, now: Date): Promise<DailyTimeEntries>;
  register(userId: string, now: Date): Promise<DailyTimeEntries>;
}

export class DefaultTimeEntryService implements TimeEntryService {
  private readonly repository: TimeEntryRepository;

  constructor(repository: TimeEntryRepository) {
    this.repository = repository;
  }

  async findMonth(userId: string, monthKey: string, now: Date) {
    const entries = await this.repository.findByUserAndMonth(userId, monthKey);
    return createMonthlyTimeEntries(monthKey, entries, now);
  }

  async findToday(userId: string, now: Date) {
    const { dayKey } = getBusinessDateKeys(now);
    const entries = await this.repository.findByUserAndDay(userId, dayKey);
    return createDailyTimeEntries(now, entries);
  }

  async register(userId: string, now: Date) {
    const { dayKey, monthKey } = getBusinessDateKeys(now);
    const currentEntries = await this.repository.findByUserAndDay(userId, dayKey);

    const activeEntries = currentEntries.filter((entry) => entry.status === 'ACTIVE');

    if (activeEntries.length >= MAX_DAILY_TIME_ENTRIES) {
      throw new DailyTimeEntryLimitError();
    }

    const entry = await this.repository.create({ dayKey, monthKey, userId });
    return createDailyTimeEntries(now, [...activeEntries, entry]);
  }
}
