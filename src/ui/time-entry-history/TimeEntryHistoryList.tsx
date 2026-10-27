import type { MonthlyTimeEntryDay } from '@/application/time-entries/time-entry-service';
import type { TimeEntryCorrection } from '@/domain/time-entry-correction';
import { Button } from '@/ui/components/Button';
import { DataList, DataListBody, DataListHeader, DataListRow } from '@/ui/components/DataList';
import { formatBusinessDayKey, formatWorkedDuration } from '@/ui/formatters/business-time';
import { DayStatusIndicator } from '@/ui/time-entry-history/DayStatusIndicator';
import { TimeEntryBadge } from '@/ui/time-entry-history/TimeEntryBadge';
import { getDayStatus } from '@/ui/time-entry-history/day-status';

interface TimeEntryHistoryListProps {
  corrections: TimeEntryCorrection[];
  canApplyDirectly: boolean;
  days: MonthlyTimeEntryDay[];
  isPeriodClosed: boolean;
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
  isPeriodClosed,
  onOpenCorrections,
}: TimeEntryHistoryListProps) {
  return (
    <DataList>
      <DataListHeader className="grid-cols-[1.25rem_minmax(8rem,0.8fr)_minmax(16rem,2fr)_6rem_13rem] text-center">
        <span aria-label="Status" />
        <span>Data</span>
        <span>Batidas</span>
        <span>Total</span>
        <span>Ações</span>
      </DataListHeader>

      <DataListBody>
        {days.map((day) => (
          <DataListRow
            className={`relative md:grid-cols-[1.25rem_minmax(8rem,0.8fr)_minmax(16rem,2fr)_6rem_13rem] ${day.isFuture ? 'bg-background opacity-60' : ''}`}
            key={day.dayKey}
          >
            <div className="absolute left-4 top-4 flex h-5 items-center justify-center md:static">
              <DayStatusIndicator status={getDayStatus(day, corrections)} />
            </div>

            <div className="flex items-center justify-between gap-4 pl-7 md:block md:pl-0 md:text-center">
              <time className="font-medium capitalize" dateTime={day.dayKey}>
                {formatBusinessDayKey(day.dayKey)}
              </time>
              <span className="font-medium md:hidden">
                {formatWorkedDuration(day.workedMilliseconds)}
              </span>
            </div>

            {day.entries.length > 0 ? (
              <div className="flex flex-wrap gap-2 md:justify-center">
                {day.entries.map((entry) => (
                  <TimeEntryBadge entry={entry} key={entry.id} />
                ))}
              </div>
            ) : (
              <span className="text-content-muted md:text-center">Sem registros</span>
            )}

            <span className="hidden text-center font-medium md:block">
              {formatWorkedDuration(day.workedMilliseconds)}
            </span>

            <div className="flex flex-wrap justify-end gap-2 md:justify-center">
              {!day.isFuture &&
                (!isPeriodClosed ||
                  corrections.some((correction) => correction.dayKey === day.dayKey)) && (
                  <Button
                    onClick={() => {
                      onOpenCorrections(day);
                    }}
                    size="small"
                    type="button"
                    variant="secondary"
                  >
                    {isPeriodClosed
                      ? 'Histórico'
                      : hasPendingCorrection(corrections, day.dayKey)
                        ? canApplyDirectly
                          ? 'Revisar'
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
