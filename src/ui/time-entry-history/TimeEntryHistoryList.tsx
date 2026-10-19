import type { MonthlyTimeEntryDay } from '@/application/time-entries/time-entry-service';
import type { TimeEntryAdjustment } from '@/domain/time-entry-adjustment';
import { Button } from '@/ui/components/Button';
import { DataList, DataListBody, DataListHeader, DataListRow } from '@/ui/components/DataList';
import { formatBusinessDayKey, formatWorkedDuration } from '@/ui/formatters/business-time';
import { TimeEntryBadge } from '@/ui/time-entry-history/TimeEntryBadge';

interface TimeEntryHistoryListProps {
  adjustments: TimeEntryAdjustment[];
  canApplyDirectly: boolean;
  days: MonthlyTimeEntryDay[];
  onAdjust: (day: MonthlyTimeEntryDay) => void;
  onReview: (day: MonthlyTimeEntryDay) => void;
}

function countPendingAdjustments(adjustments: TimeEntryAdjustment[], dayKey: string) {
  return adjustments.filter(
    (adjustment) => adjustment.dayKey === dayKey && adjustment.status === 'PENDING',
  ).length;
}

export function TimeEntryHistoryList({
  adjustments,
  canApplyDirectly,
  days,
  onAdjust,
  onReview,
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
                  <TimeEntryBadge
                    entry={entry}
                    hasPendingAdjustment={adjustments.some(
                      (adjustment) =>
                        adjustment.status === 'PENDING' &&
                        adjustment.targetTimeEntryId === entry.id,
                    )}
                    key={entry.id}
                  />
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
                    onAdjust(day);
                  }}
                  size="small"
                  type="button"
                  variant="secondary"
                >
                  {canApplyDirectly ? 'Novo ajuste' : 'Solicitar ajuste'}
                </Button>
              )}
              {!day.isFuture && (
                <Button
                  disabled={!adjustments.some((adjustment) => adjustment.dayKey === day.dayKey)}
                  onClick={() => {
                    onReview(day);
                  }}
                  size="small"
                  type="button"
                  variant="secondary"
                >
                  {canApplyDirectly && countPendingAdjustments(adjustments, day.dayKey) > 0
                    ? `Revisar (${String(countPendingAdjustments(adjustments, day.dayKey))})`
                    : 'Ver solicitações'}
                </Button>
              )}
            </div>
          </DataListRow>
        ))}
      </DataListBody>
    </DataList>
  );
}
