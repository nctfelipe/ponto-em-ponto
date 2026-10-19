import { useEffect, useRef } from 'react';
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
  onApprove?: ((adjustmentId: string) => void) | undefined;
  onClose: () => void;
  onReject?: ((adjustmentId: string) => void) | undefined;
}

export function TimeEntryAdjustmentReviewDialog({
  adjustments,
  dayKey,
  errorMessage,
  isSubmitting,
  onApprove,
  onClose,
  onReject,
}: TimeEntryAdjustmentReviewDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

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
        isSubmitting={isSubmitting}
        onApprove={onApprove}
        onReject={onReject}
      />
      {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
      <div className="mt-6 flex justify-end">
        <Button onClick={onClose} type="button" variant="secondary">
          Fechar
        </Button>
      </div>
    </dialog>
  );
}
