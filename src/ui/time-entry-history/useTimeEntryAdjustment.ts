import { useState } from 'react';
import {
  ClosedTimePeriodError,
  TimeEntryAdjustmentConflictError,
  TimeEntryAdjustmentLimitError,
  TimeEntryAdjustmentNotPendingError,
  type TimeEntryAdjustmentCommand,
  type TimeEntryAdjustmentDecisionCommand,
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
  if (error instanceof TimeEntryAdjustmentNotPendingError) {
    return 'Esta solicitação já foi analisada.';
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

    async function execute(requests: TimeEntryAdjustmentCommand[], applyDirectly: boolean) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsSubmitting(true);

      try {
        const input = {
          commands: requests,
          requestedById,
          userId,
        };

        if (applyDirectly) {
          await adjustmentService.applyAdjustments(input);
          setSuccessMessage('Ajustes aplicados com sucesso.');
        } else {
          await adjustmentService.submitAdjustments(input);
          setSuccessMessage(
            requests.length === 1
              ? 'Solicitação enviada para análise.'
              : 'Solicitações enviadas para análise.',
          );
        }
        return true;
      } catch (error: unknown) {
        setErrorMessage(getErrorMessage(error));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    }

    async function decideAll(decisions: TimeEntryAdjustmentDecisionCommand[]) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsSubmitting(true);

      try {
        await adjustmentService.decideAdjustments({ decidedById: requestedById, decisions });
        setSuccessMessage('Decisões aplicadas com sucesso.');
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
      applyAll: (requests: TimeEntryAdjustmentCommand[]) => execute(requests, true),
      decideAll,
      submitAll: (requests: TimeEntryAdjustmentCommand[]) => execute(requests, false),
      resetFeedback: () => {
        setErrorMessage(null);
        setSuccessMessage(null);
      },
      successMessage,
    };
  };
}
