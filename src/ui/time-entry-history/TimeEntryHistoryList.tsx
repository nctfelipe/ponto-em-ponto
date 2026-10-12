import type { MonthlyTimeEntryDay } from '@/application/time-entries/time-entry-service';
import type { TimeEntry } from '@/domain/time-entry';
import { DataList, DataListBody, DataListHeader, DataListRow } from '@/ui/components/DataList';
import { formatBusinessDayKey, formatWorkedDuration } from '@/ui/formatters/business-time';
import { TimeEntryBadge } from '@/ui/time-entry-history/TimeEntryBadge';

interface TimeEntryHistoryListProps {
  days: MonthlyTimeEntryDay[];
  onAdjust?: (entry: TimeEntry) => void;
}

export function TimeEntryHistoryList({ days, onAdjust }: TimeEntryHistoryListProps) {
  return (
    <DataList>
      <DataListHeader className="grid-cols-[minmax(8rem,0.8fr)_minmax(16rem,2fr)_6rem]">
        <span>Data</span>
        <span>Batidas</span>
        <span className="text-right">Total</span>
      </DataListHeader>

      <DataListBody>
        {days.map((day) => (
          <DataListRow
            className={`md:grid-cols-[minmax(8rem,0.8fr)_minmax(16rem,2fr)_6rem] ${day.isFuture ? 'bg-background opacity-60' : ''}`}
            key={day.dayKey}
          >
            <div className="flex items-center justify-between gap-4 md:block">
              <time className="font-medium capitalize" dateTime={day.dayKey}>
                {formatBusinessDayKey(day.dayKey)}
              </time>
              <span className="font-medium md:hidden">
                {formatWorkedDuration(day.workedMilliseconds)}
              </span>
            </div>

            {day.entries.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {day.entries.map((entry) => (
                  <TimeEntryBadge entry={entry} key={entry.id} onAdjust={onAdjust} />
                ))}
              </div>
            ) : (
              <span className="text-content-muted">Sem registros</span>
            )}

            <span className="hidden text-right font-medium md:block">
              {formatWorkedDuration(day.workedMilliseconds)}
            </span>
          </DataListRow>
        ))}
      </DataListBody>
    </DataList>
  );
}
