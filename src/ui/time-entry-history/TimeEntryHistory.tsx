import { useState } from 'react';
import type { MonthlyTimeEntryDay } from '@/application/time-entries/time-entry-service';
import { Alert } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import { FeedbackMessage } from '@/ui/components/FeedbackMessage';
import { useTimeEntryAdjustment, useTimeEntryHistory } from '@/ui/composition';
import { TimeEntryAdjustmentDialog } from '@/ui/time-entry-history/TimeEntryAdjustmentDialog';
import { TimeEntryAdjustmentReviewDialog } from '@/ui/time-entry-history/TimeEntryAdjustmentReviewDialog';
import { MonthSelector } from '@/ui/time-entry-history/MonthSelector';
import { TimeEntryHistoryList } from '@/ui/time-entry-history/TimeEntryHistoryList';

interface TimeEntryHistoryProps {
  canApplyDirectly: boolean;
  requestedById: string;
  userId: string;
}

type OpenDialog = { day: MonthlyTimeEntryDay; type: 'ADJUST' | 'REVIEW' } | null;

export function TimeEntryHistory({
  canApplyDirectly,
  requestedById,
  userId,
}: TimeEntryHistoryProps) {
  const history = useTimeEntryHistory(userId);
  const adjustment = useTimeEntryAdjustment({ requestedById, userId });
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);

  function openAdjustment(day: MonthlyTimeEntryDay) {
    adjustment.resetFeedback();
    setOpenDialog({ day, type: 'ADJUST' });
  }

  function closeDialog() {
    if (adjustment.isSubmitting) return;
    setOpenDialog(null);
  }

  async function submitAdjustments(requests: Parameters<typeof adjustment.submitAll>[0]) {
    const succeeded = canApplyDirectly
      ? await adjustment.applyAll(requests)
      : await adjustment.submitAll(requests);
    if (succeeded) history.load();
    return succeeded;
  }

  async function decideAdjustment(adjustmentId: string, decision: 'APPROVE' | 'REJECT') {
    const succeeded =
      decision === 'APPROVE'
        ? await adjustment.approve(adjustmentId)
        : await adjustment.reject(adjustmentId);

    if (succeeded) {
      setOpenDialog(null);
      history.load();
    }
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
        <TimeEntryHistoryList
          adjustments={history.adjustments}
          canApplyDirectly={canApplyDirectly}
          days={history.days}
          onAdjust={openAdjustment}
          onReview={(day) => {
            adjustment.resetFeedback();
            setOpenDialog({ day, type: 'REVIEW' });
          }}
        />
      )}

      {openDialog?.type === 'ADJUST' && (
        <TimeEntryAdjustmentDialog
          adjustments={history.adjustments.filter((item) => item.dayKey === openDialog.day.dayKey)}
          day={openDialog.day}
          errorMessage={adjustment.errorMessage}
          isDirectAdjustment={canApplyDirectly}
          isSubmitting={adjustment.isSubmitting}
          onCancel={closeDialog}
          onSubmit={submitAdjustments}
        />
      )}

      {openDialog?.type === 'REVIEW' && (
        <TimeEntryAdjustmentReviewDialog
          adjustments={history.adjustments.filter((item) => item.dayKey === openDialog.day.dayKey)}
          dayKey={openDialog.day.dayKey}
          errorMessage={adjustment.errorMessage}
          isSubmitting={adjustment.isSubmitting}
          onApprove={
            canApplyDirectly
              ? (adjustmentId) => {
                  void decideAdjustment(adjustmentId, 'APPROVE');
                }
              : undefined
          }
          onClose={closeDialog}
          onReject={
            canApplyDirectly
              ? (adjustmentId) => {
                  void decideAdjustment(adjustmentId, 'REJECT');
                }
              : undefined
          }
        />
      )}
    </>
  );
}
