import type { MonthlyTimeEntryDay } from '@/application/time-entries/time-entry-service';
import { formatBusinessDayKey, formatWorkedDuration } from '@/ui/formatters/business-time';
import { TimeEntryBadge } from '@/ui/time-entry-history/TimeEntryBadge';

interface TimeEntryHistoryListProps {
  days: MonthlyTimeEntryDay[];
}

export function TimeEntryHistoryList({ days }: TimeEntryHistoryListProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="hidden grid-cols-[minmax(8rem,0.8fr)_minmax(16rem,2fr)_6rem] gap-4 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 md:grid">
        <span>Data</span>
        <span>Batidas</span>
        <span className="text-right">Total</span>
      </div>

      <ol className="divide-y divide-slate-200">
        {days.map((day) => (
          <li
            className={`grid gap-3 px-4 py-3 md:grid-cols-[minmax(8rem,0.8fr)_minmax(16rem,2fr)_6rem] md:items-center md:gap-4 ${day.isFuture ? 'bg-slate-50 text-slate-400' : ''}`}
            key={day.dayKey}
          >
            <div className="flex items-center justify-between gap-4 md:block">
              <time className="font-medium capitalize" dateTime={day.dayKey}>
                {formatBusinessDayKey(day.dayKey)}
              </time>
              <span className="font-semibold md:hidden">
                {formatWorkedDuration(day.workedMilliseconds)}
              </span>
            </div>

            {day.entries.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {day.entries.map((entry) => (
                  <TimeEntryBadge entry={entry} key={entry.id} />
                ))}
              </div>
            ) : (
              <span className="text-sm text-slate-500">Sem registros</span>
            )}

            <span className="hidden text-right font-semibold md:block">
              {formatWorkedDuration(day.workedMilliseconds)}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
