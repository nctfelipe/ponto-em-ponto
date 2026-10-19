import { useState } from 'react';
import type { MonthlyTimeEntryDay } from '@/application/time-entries/time-entry-service';
import { Alert } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import { FeedbackMessage } from '@/ui/components/FeedbackMessage';
import { useTimeEntryAdjustment, useTimeEntryHistory } from '@/ui/composition';
import { TimeEntryAdjustmentDialog } from '@/ui/time-entry-history/TimeEntryAdjustmentDialog';
import { MonthSelector } from '@/ui/time-entry-history/MonthSelector';
import { TimeEntryHistoryList } from '@/ui/time-entry-history/TimeEntryHistoryList';

interface TimeEntryHistoryProps {
  requestedById: string;
  userId: string;
}

export function TimeEntryHistory({ requestedById, userId }: TimeEntryHistoryProps) {
  const history = useTimeEntryHistory(userId);
  const adjustment = useTimeEntryAdjustment({ requestedById, userId });
  const [selectedDay, setSelectedDay] = useState<MonthlyTimeEntryDay | null>(null);

  function openAdjustment(day: MonthlyTimeEntryDay) {
    adjustment.resetFeedback();
    setSelectedDay(day);
  }

  function closeAdjustment() {
    if (adjustment.isSubmitting) return;
    setSelectedDay(null);
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

      {adjustment.successMessage && <Alert variant="success">{adjustment.successMessage}</Alert>}

      {!history.isLoading && !history.hasError && (
        <TimeEntryHistoryList days={history.days} onAdjust={openAdjustment} />
      )}

      {selectedDay && (
        <TimeEntryAdjustmentDialog
          day={selectedDay}
          errorMessage={adjustment.errorMessage}
          isSubmitting={adjustment.isSubmitting}
          onCancel={closeAdjustment}
          onChange={adjustment.requestChange}
          onCreate={adjustment.requestAddition}
          onRemove={adjustment.requestRemoval}
        />
      )}
    </>
  );
}
