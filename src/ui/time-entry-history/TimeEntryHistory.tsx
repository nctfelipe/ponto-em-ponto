import { useState } from 'react';
import type { MonthlyTimeEntryDay } from '@/application/time-entries/time-entry-service';
import { Alert } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import { FeedbackMessage } from '@/ui/components/FeedbackMessage';
import { useTimeEntryCorrection, useTimeEntryHistory } from '@/ui/composition';
import { TimeEntryCorrectionDialog } from '@/ui/time-entry-history/TimeEntryCorrectionDialog';
import { MonthSelector } from '@/ui/time-entry-history/MonthSelector';
import { TimeEntryHistoryList } from '@/ui/time-entry-history/TimeEntryHistoryList';

interface TimeEntryHistoryProps {
  canApplyDirectly: boolean;
  requestedById: string;
  userId: string;
}

export function TimeEntryHistory({
  canApplyDirectly,
  requestedById,
  userId,
}: TimeEntryHistoryProps) {
  const history = useTimeEntryHistory(userId);
  const correction = useTimeEntryCorrection({ requestedById, userId });
  const [selectedDay, setSelectedDay] = useState<MonthlyTimeEntryDay | null>(null);

  function openCorrections(day: MonthlyTimeEntryDay) {
    correction.resetFeedback();
    setSelectedDay(day);
  }

  function closeDialog() {
    if (correction.isSubmitting) return;
    setSelectedDay(null);
  }

  async function submitCorrection(
    proposedEntries: Parameters<typeof correction.request>[0]['proposedEntries'],
  ) {
    if (!selectedDay) return false;
    const input = { dayKey: selectedDay.dayKey, proposedEntries };
    const succeeded = canApplyDirectly
      ? await correction.apply(input)
      : await correction.request(input);
    if (succeeded) history.load();
    return succeeded;
  }

  async function decideCorrection(id: string, status: 'APPROVED' | 'REJECTED') {
    const succeeded = await correction.decide(id, status);
    if (succeeded) history.load();
    return succeeded;
  }

  return (
    <>
      <MonthSelector monthKey={history.monthKey} onChange={history.selectMonth} />

      {history.isLoading && (
        <FeedbackMessage variant="loading">Carregando histórico...</FeedbackMessage>
      )}

      {!history.isLoading && history.hasError && (
        <>
          <Alert variant="error">Não foi possível carregar o histórico.</Alert>
          <Button onClick={history.load} type="button" variant="secondary">
            Tentar novamente
          </Button>
        </>
      )}

      {correction.successMessage && <Alert variant="success">{correction.successMessage}</Alert>}

      {!history.isLoading && !history.hasError && (
        <TimeEntryHistoryList
          corrections={history.corrections}
          canApplyDirectly={canApplyDirectly}
          days={history.days}
          onOpenCorrections={openCorrections}
        />
      )}

      {selectedDay && (
        <TimeEntryCorrectionDialog
          canApplyDirectly={canApplyDirectly}
          corrections={history.corrections.filter((item) => item.dayKey === selectedDay.dayKey)}
          day={selectedDay}
          errorMessage={correction.errorMessage}
          isSubmitting={correction.isSubmitting}
          onClose={closeDialog}
          onDecision={decideCorrection}
          onSubmit={submitCorrection}
        />
      )}
    </>
  );
}
