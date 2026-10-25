import type { MonthlyTimeEntryDay } from '@/application/time-entries/time-entry-service';
import type { TimeEntryCorrection } from '@/domain/time-entry-correction';

export type DayStatus = 'ADJUSTED' | 'INCONSISTENT' | 'PENDING' | 'REJECTED';

export function getDayStatus(
  day: MonthlyTimeEntryDay,
  corrections: TimeEntryCorrection[],
): DayStatus | null {
  if (day.isFuture) return null;
  if (day.entries.length > 0 && day.entries.length % 2 !== 0) return 'INCONSISTENT';

  const dailyCorrections = corrections.filter(({ dayKey }) => dayKey === day.dayKey);
  if (dailyCorrections.some(({ status }) => status === 'PENDING')) return 'PENDING';

  const latest = dailyCorrections
    .filter(({ status }) => status !== 'PENDING')
    .sort((left, right) => right.requestedAt.getTime() - left.requestedAt.getTime())[0];

  if (latest?.status === 'APPROVED') return 'ADJUSTED';
  if (latest?.status === 'REJECTED') return 'REJECTED';
  return null;
}
