import { useEffect, useRef, useState } from 'react';
import type { TimeEntryAdjustmentDecisionCommand } from '@/application/time-entry-adjustments/time-entry-adjustment-service';
import type { TimeEntryAdjustment } from '@/domain/time-entry-adjustment';
import { Alert } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import { formatBusinessDayKey } from '@/ui/formatters/business-time';
import { TimeEntryAdjustmentHistory } from '@/ui/time-entry-history/TimeEntryAdjustmentHistory';

interface TimeEntryAdjustmentReviewDialogProps {
  adjustments: TimeEntryAdjustment[];
  dayKey: string;
  errorMessage: string | null;
  isSubmitting: boolean;
  canDecide: boolean;
  onClose: () => void;
  onSubmit: (decisions: TimeEntryAdjustmentDecisionCommand[]) => Promise<boolean>;
}

export function TimeEntryAdjustmentReviewDialog({
  adjustments,
  canDecide,
  dayKey,
  errorMessage,
  isSubmitting,
  onClose,
  onSubmit,
}: TimeEntryAdjustmentReviewDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [decisions, setDecisions] = useState<Record<string, 'APPROVE' | 'REJECT' | undefined>>({});

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  async function submitDecisions() {
    const commands = Object.entries(decisions).flatMap(([adjustmentId, decision]) =>
      decision ? [{ adjustmentId, decision }] : [],
    );
    if (await onSubmit(commands)) onClose();
  }

  const hasDecisions = Object.values(decisions).some(Boolean);

  return (
    <dialog
      aria-labelledby="review-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-surface p-6 shadow-xl backdrop:bg-content/50"
      onCancel={onClose}
      ref={dialogRef}
    >
      <h2 className="text-xl font-semibold capitalize text-content" id="review-title">
        Solicitações de {formatBusinessDayKey(dayKey)}
      </h2>
      <TimeEntryAdjustmentHistory
        adjustments={adjustments}
        decisions={decisions}
        isSubmitting={isSubmitting}
        onDecision={
          canDecide
            ? (adjustmentId, decision) => {
                setDecisions((current) => ({ ...current, [adjustmentId]: decision }));
              }
            : undefined
        }
      />
      {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
      <div className="mt-6 flex justify-end gap-3">
        <Button onClick={onClose} type="button" variant="secondary">
          {canDecide ? 'Cancelar' : 'Fechar'}
        </Button>
        {canDecide && (
          <Button
            disabled={!hasDecisions || isSubmitting}
            onClick={() => {
              void submitDecisions();
            }}
            type="button"
          >
            {isSubmitting ? 'Confirmando...' : 'Confirmar decisões'}
          </Button>
        )}
      </div>
    </dialog>
  );
}
