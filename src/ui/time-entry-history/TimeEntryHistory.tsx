import { useState } from 'react';
import type { TimeEntry } from '@/domain/time-entry';
import { Alert } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import { FeedbackMessage } from '@/ui/components/FeedbackMessage';
import { useTimeEntryAdjustment, useTimeEntryHistory } from '@/ui/composition';
import { TimeEntryAdjustmentDialog } from '@/ui/time-entry-history/TimeEntryAdjustmentDialog';
import { TimeEntryHistoryControls } from '@/ui/time-entry-history/TimeEntryHistoryControls';
import { TimeEntryHistoryList } from '@/ui/time-entry-history/TimeEntryHistoryList';

interface TimeEntryHistoryProps {
  requestedById: string;
  userId: string;
}

export function TimeEntryHistory({ requestedById, userId }: TimeEntryHistoryProps) {
  const history = useTimeEntryHistory(userId);
  const adjustment = useTimeEntryAdjustment({ requestedById, userId });
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);

  function openAdjustment(entry: TimeEntry | null) {
    adjustment.resetFeedback();
    setSelectedEntry(entry);
    setIsAdjustmentOpen(true);
  }

  function closeAdjustment() {
    if (adjustment.isSubmitting) return;
    setIsAdjustmentOpen(false);
  }

  return (
    <>
      <TimeEntryHistoryControls
        monthKey={history.monthKey}
        onAdd={() => {
          openAdjustment(null);
        }}
        onMonthChange={history.selectMonth}
      />

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

      {isAdjustmentOpen && (
        <TimeEntryAdjustmentDialog
          entry={selectedEntry}
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
