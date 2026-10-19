import type { TimeEntryAdjustment } from '@/domain/time-entry-adjustment';
import { Badge } from '@/ui/components/Badge';
import { Button } from '@/ui/components/Button';
import {
  formatBusinessShortDateTime,
  formatBusinessShortTime,
} from '@/ui/formatters/business-time';

interface TimeEntryAdjustmentHistoryProps {
  adjustments: TimeEntryAdjustment[];
  decisions?: Record<string, 'APPROVE' | 'REJECT' | undefined>;
  isSubmitting?: boolean;
  onDecision?:
    ((adjustmentId: string, decision: 'APPROVE' | 'REJECT' | undefined) => void) | undefined;
}

const statusPresentation = {
  APPROVED: { label: 'Aprovada', variant: 'success' },
  PENDING: { label: 'Pendente', variant: 'warning' },
  REJECTED: { label: 'Rejeitada', variant: 'neutral' },
} as const;

function describeAdjustment(adjustment: TimeEntryAdjustment) {
  if (adjustment.type === 'ADD' && adjustment.proposedRecordedAt) {
    return `Inclusão às ${formatBusinessShortTime(adjustment.proposedRecordedAt)}`;
  }

  if (
    adjustment.type === 'CHANGE' &&
    adjustment.currentRecordedAt &&
    adjustment.proposedRecordedAt
  ) {
    return `${formatBusinessShortTime(adjustment.currentRecordedAt)} para ${formatBusinessShortTime(adjustment.proposedRecordedAt)}`;
  }

  if (adjustment.currentRecordedAt) {
    return `Remoção das ${formatBusinessShortTime(adjustment.currentRecordedAt)}`;
  }

  return 'Solicitação de ajuste';
}

export function TimeEntryAdjustmentHistory({
  adjustments,
  decisions = {},
  isSubmitting = false,
  onDecision,
}: TimeEntryAdjustmentHistoryProps) {
  if (adjustments.length === 0) return null;

  return (
    <section className="mt-6 border-t border-border pt-5">
      <h3 className="font-medium text-content">Histórico de ajustes</h3>
      <ul className="mt-3 space-y-3">
        {adjustments.map((adjustment) => {
          const status = statusPresentation[adjustment.status];
          return (
            <li
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-background p-3 text-sm"
              key={adjustment.id}
            >
              <div>
                <p className="text-content">{describeAdjustment(adjustment)}</p>
                <time
                  className="text-content-muted"
                  dateTime={adjustment.requestedAt.toISOString()}
                >
                  Solicitada em {formatBusinessShortDateTime(adjustment.requestedAt)}
                </time>
                {adjustment.decidedAt && (
                  <time
                    className="block text-content-muted"
                    dateTime={adjustment.decidedAt.toISOString()}
                  >
                    Decidida em {formatBusinessShortDateTime(adjustment.decidedAt)}
                  </time>
                )}
              </div>
              <Badge variant={status.variant}>{status.label}</Badge>
              {adjustment.status === 'PENDING' && onDecision && (
                <div className="flex gap-2">
                  <Button
                    disabled={isSubmitting}
                    onClick={() => {
                      onDecision(
                        adjustment.id,
                        decisions[adjustment.id] === 'REJECT' ? undefined : 'REJECT',
                      );
                    }}
                    size="small"
                    type="button"
                    variant={decisions[adjustment.id] === 'REJECT' ? 'danger' : 'secondary'}
                  >
                    Rejeitar
                  </Button>
                  <Button
                    disabled={isSubmitting}
                    onClick={() => {
                      onDecision(
                        adjustment.id,
                        decisions[adjustment.id] === 'APPROVE' ? undefined : 'APPROVE',
                      );
                    }}
                    size="small"
                    type="button"
                    variant={decisions[adjustment.id] === 'APPROVE' ? 'primary' : 'secondary'}
                  >
                    Aprovar
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
