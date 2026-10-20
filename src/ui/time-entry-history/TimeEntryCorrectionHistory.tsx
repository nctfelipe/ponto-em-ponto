import type { TimeEntryCorrection } from '@/domain/time-entry-correction';
import { Badge } from '@/ui/components/Badge';
import { Button } from '@/ui/components/Button';
import {
  formatBusinessShortDateTime,
  formatBusinessShortTime,
} from '@/ui/formatters/business-time';

interface Props {
  canDecide: boolean;
  corrections: TimeEntryCorrection[];
  isSubmitting: boolean;
  onDecision: (correctionId: string, status: 'APPROVED' | 'REJECTED') => void;
}

const statusPresentation = {
  APPROVED: { label: 'Aprovada', variant: 'success' },
  PENDING: { label: 'Pendente', variant: 'warning' },
  REJECTED: { label: 'Rejeitada', variant: 'neutral' },
} as const;

function formatEntries(correction: TimeEntryCorrection, proposed: boolean) {
  const entries = proposed ? correction.proposedEntries : correction.previousEntries;
  return entries.length > 0
    ? entries.map(({ recordedAt }) => formatBusinessShortTime(recordedAt)).join(' · ')
    : 'Sem batidas';
}

export function TimeEntryCorrectionHistory({
  canDecide,
  corrections,
  isSubmitting,
  onDecision,
}: Props) {
  if (corrections.length === 0) {
    return <p className="mt-5 text-sm text-content-muted">Nenhuma correção registrada.</p>;
  }

  return (
    <ul className="mt-5 space-y-3">
      {[...corrections].reverse().map((correction) => {
        const status = statusPresentation[correction.status];
        return (
          <li className="rounded-lg border border-border p-4 text-sm" key={correction.id}>
            <div className="flex items-center justify-between gap-3">
              <time className="text-content-muted" dateTime={correction.requestedAt.toISOString()}>
                {formatBusinessShortDateTime(correction.requestedAt)}
              </time>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <p className="mt-3 text-content-muted">Antes</p>
            <p className="text-content">{formatEntries(correction, false)}</p>
            <p className="mt-2 text-content-muted">Proposto</p>
            <p className="text-content">{formatEntries(correction, true)}</p>

            {canDecide && correction.status === 'PENDING' && (
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  disabled={isSubmitting}
                  onClick={() => {
                    onDecision(correction.id, 'REJECTED');
                  }}
                  size="small"
                  type="button"
                  variant="secondary"
                >
                  Rejeitar
                </Button>
                <Button
                  disabled={isSubmitting}
                  onClick={() => {
                    onDecision(correction.id, 'APPROVED');
                  }}
                  size="small"
                  type="button"
                >
                  Aprovar
                </Button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
