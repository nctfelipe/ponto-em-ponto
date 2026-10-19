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

export type TimeEntryAdjustmentSubmission =
  | { proposedRecordedAt: Date; type: 'ADD' }
  | { proposedRecordedAt: Date; timeEntryId: string; type: 'CHANGE' }
  | { timeEntryId: string; type: 'REMOVE' };

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

    async function submitAll(requests: TimeEntryAdjustmentSubmission[]) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsSubmitting(true);

      try {
        await Promise.all(
          requests.map((request) => {
            if (request.type === 'ADD') {
              return adjustmentService.requestAddition({
                proposedRecordedAt: request.proposedRecordedAt,
                requestedById,
                userId,
              });
            }

            if (request.type === 'CHANGE') {
              return adjustmentService.requestChange({
                proposedRecordedAt: request.proposedRecordedAt,
                requestedById,
                timeEntryId: request.timeEntryId,
                userId,
              });
            }

            return adjustmentService.requestRemoval({
              requestedById,
              timeEntryId: request.timeEntryId,
              userId,
            });
          }),
        );
        setSuccessMessage(
          requests.length === 1
            ? 'Solicitação enviada para análise.'
            : 'Solicitações enviadas para análise.',
        );
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
      submitAll,
      resetFeedback: () => {
        setErrorMessage(null);
        setSuccessMessage(null);
      },
      successMessage,
    };
  };
}
