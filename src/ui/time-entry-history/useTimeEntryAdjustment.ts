import { useState } from 'react';
import {
  ClosedTimePeriodError,
  TimeEntryAdjustmentConflictError,
  TimeEntryAdjustmentLimitError,
  type TimeEntryAdjustmentService,
  TimeEntryNotAdjustableError,
} from '@/application/time-entry-adjustments/time-entry-adjustment-service';

interface CreateUseTimeEntryAdjustmentDependencies {
  adjustmentService: TimeEntryAdjustmentService;
}

interface AdjustmentContext {
  requestedById: string;
  userId: string;
}

function getErrorMessage(error: unknown) {
  if (error instanceof ClosedTimePeriodError) return 'Este período já está fechado.';
  if (error instanceof TimeEntryAdjustmentConflictError) {
    return 'Esta batida já possui uma solicitação pendente.';
  }
  if (error instanceof TimeEntryAdjustmentLimitError) {
    return 'Não é possível adicionar outra batida neste dia.';
  }
  if (error instanceof TimeEntryNotAdjustableError) {
    return 'Esta batida não pode mais ser ajustada.';
  }
  return 'Não foi possível enviar a solicitação.';
}

export function createUseTimeEntryAdjustment({
  adjustmentService,
}: CreateUseTimeEntryAdjustmentDependencies) {
  return function useTimeEntryAdjustment({ requestedById, userId }: AdjustmentContext) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    async function submit(request: () => Promise<unknown>) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsSubmitting(true);

      try {
        await request();
        setSuccessMessage('Solicitação enviada para análise.');
        return true;
      } catch (error: unknown) {
        setErrorMessage(getErrorMessage(error));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    }

    return {
      errorMessage,
      isSubmitting,
      requestAddition: (proposedRecordedAt: Date) =>
        submit(() =>
          adjustmentService.requestAddition({ proposedRecordedAt, requestedById, userId }),
        ),
      requestChange: (timeEntryId: string, proposedRecordedAt: Date) =>
        submit(() =>
          adjustmentService.requestChange({
            proposedRecordedAt,
            requestedById,
            timeEntryId,
            userId,
          }),
        ),
      requestRemoval: (timeEntryId: string) =>
        submit(() => adjustmentService.requestRemoval({ requestedById, timeEntryId, userId })),
      resetFeedback: () => {
        setErrorMessage(null);
        setSuccessMessage(null);
      },
      successMessage,
    };
  };
}
