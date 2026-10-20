import type { MonthlyTimeEntryDay } from '@/application/time-entries/time-entry-service';
import type { TimeEntryCorrection } from '@/domain/time-entry-correction';
import { Button } from '@/ui/components/Button';
import { DataList, DataListBody, DataListHeader, DataListRow } from '@/ui/components/DataList';
import { formatBusinessDayKey, formatWorkedDuration } from '@/ui/formatters/business-time';
import { TimeEntryBadge } from '@/ui/time-entry-history/TimeEntryBadge';

interface TimeEntryHistoryListProps {
  corrections: TimeEntryCorrection[];
  canApplyDirectly: boolean;
  days: MonthlyTimeEntryDay[];
  onOpenCorrections: (day: MonthlyTimeEntryDay) => void;
}

function hasPendingCorrection(corrections: TimeEntryCorrection[], dayKey: string) {
  return corrections.some(
    (correction) => correction.dayKey === dayKey && correction.status === 'PENDING',
  );
}

export function TimeEntryHistoryList({
  corrections,
  canApplyDirectly,
  days,
  onOpenCorrections,
}: TimeEntryHistoryListProps) {
  return (
    <DataList>
      <DataListHeader className="grid-cols-[minmax(8rem,0.8fr)_minmax(16rem,2fr)_6rem_13rem]">
        <span>Data</span>
        <span>Batidas</span>
        <span className="text-right">Total</span>
        <span className="text-right">Ações</span>
      </DataListHeader>

      <DataListBody>
        {days.map((day) => (
          <DataListRow
            className={`md:grid-cols-[minmax(8rem,0.8fr)_minmax(16rem,2fr)_6rem_13rem] ${day.isFuture ? 'bg-background opacity-60' : ''}`}
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
                  <TimeEntryBadge entry={entry} key={entry.id} />
                ))}
              </div>
            ) : (
              <span className="text-content-muted">Sem registros</span>
            )}

            <span className="hidden text-right font-medium md:block">
              {formatWorkedDuration(day.workedMilliseconds)}
            </span>

            <div className="flex flex-wrap justify-end gap-2">
              {!day.isFuture && (
                <Button
                  onClick={() => {
                    onOpenCorrections(day);
                  }}
                  size="small"
                  type="button"
                  variant="secondary"
                >
                  {hasPendingCorrection(corrections, day.dayKey)
                    ? canApplyDirectly
                      ? 'Revisar (1)'
                      : 'Correção pendente'
                    : 'Correções'}
                </Button>
              )}
            </div>
          </DataListRow>
        ))}
      </DataListBody>
    </DataList>
  );
}
