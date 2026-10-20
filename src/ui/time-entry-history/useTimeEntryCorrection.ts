import { useState } from 'react';
import {
  ClosedTimePeriodError,
  InvalidTimeEntryCorrectionError,
  OutdatedTimeEntryCorrectionError,
  PendingTimeEntryCorrectionError,
  TimeEntryCorrectionNotPendingError,
  type SubmitTimeEntryCorrectionInput,
  type TimeEntryCorrectionService,
} from '@/application/time-entry-corrections/time-entry-correction-service';

interface Dependencies {
  correctionService: TimeEntryCorrectionService;
}

interface Context {
  requestedById: string;
  userId: string;
}

function getErrorMessage(error: unknown) {
  if (error instanceof ClosedTimePeriodError) return 'Este período já está fechado.';
  if (error instanceof PendingTimeEntryCorrectionError) {
    return 'Este dia já possui uma correção pendente.';
  }
  if (error instanceof InvalidTimeEntryCorrectionError) return 'Revise os horários informados.';
  if (error instanceof OutdatedTimeEntryCorrectionError) {
    return 'As batidas foram alteradas depois da solicitação. Revise a correção novamente.';
  }
  if (error instanceof TimeEntryCorrectionNotPendingError) {
    return 'Esta correção já foi analisada.';
  }
  return 'Não foi possível concluir a operação.';
}

export function createUseTimeEntryCorrection({ correctionService }: Dependencies) {
  return function useTimeEntryCorrection({ requestedById, userId }: Context) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    async function execute(action: () => Promise<void>, message: string) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsSubmitting(true);
      try {
        await action();
        setSuccessMessage(message);
        return true;
      } catch (error: unknown) {
        setErrorMessage(getErrorMessage(error));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    }

    function withContext(
      input: Pick<SubmitTimeEntryCorrectionInput, 'dayKey' | 'proposedEntries'>,
    ) {
      return { ...input, requestedById, userId };
    }

    return {
      apply: (input: Pick<SubmitTimeEntryCorrectionInput, 'dayKey' | 'proposedEntries'>) =>
        execute(
          () => correctionService.apply(withContext(input)),
          'Correção aplicada com sucesso.',
        ),
      decide: (correctionId: string, status: 'APPROVED' | 'REJECTED') =>
        execute(
          () => correctionService.decide(correctionId, status, requestedById),
          status === 'APPROVED' ? 'Correção aprovada.' : 'Correção rejeitada.',
        ),
      errorMessage,
      isSubmitting,
      request: (input: Pick<SubmitTimeEntryCorrectionInput, 'dayKey' | 'proposedEntries'>) =>
        execute(
          () => correctionService.request(withContext(input)),
          'Correção enviada para análise.',
        ),
      resetFeedback: () => {
        setErrorMessage(null);
        setSuccessMessage(null);
      },
      successMessage,
    };
  };
}
