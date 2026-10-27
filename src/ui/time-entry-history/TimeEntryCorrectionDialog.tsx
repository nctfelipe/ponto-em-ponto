import { useState } from 'react';
import type { MonthlyTimeEntryDay } from '@/application/time-entries/time-entry-service';
import type { CorrectionEntry, TimeEntryCorrection } from '@/domain/time-entry-correction';
import { Alert } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import { Dialog, DialogActions, DialogTitle } from '@/ui/components/Dialog';
import { SegmentedControl } from '@/ui/components/SegmentedControl';
import { formatBusinessDayKey } from '@/ui/formatters/business-time';
import { TimeEntryCorrectionEditor } from '@/ui/time-entry-history/TimeEntryCorrectionEditor';
import { TimeEntryCorrectionHistory } from '@/ui/time-entry-history/TimeEntryCorrectionHistory';
import { useTimeEntryCorrectionDraft } from '@/ui/time-entry-history/useTimeEntryCorrectionDraft';

interface Props {
  canApplyDirectly: boolean;
  corrections: TimeEntryCorrection[];
  day: MonthlyTimeEntryDay;
  errorMessage: string | null;
  isSubmitting: boolean;
  isReadOnly: boolean;
  onClose: () => void;
  onDecision: (id: string, status: 'APPROVED' | 'REJECTED') => Promise<boolean>;
  onSubmit: (entries: CorrectionEntry[]) => Promise<boolean>;
}

type DialogTab = 'CORRECTION' | 'HISTORY';

export function TimeEntryCorrectionDialog({
  canApplyDirectly,
  corrections,
  day,
  errorMessage,
  isSubmitting,
  isReadOnly,
  onClose,
  onDecision,
  onSubmit,
}: Props) {
  const [tab, setTab] = useState<DialogTab>(
    isReadOnly || corrections.some(({ status }) => status === 'PENDING') ? 'HISTORY' : 'CORRECTION',
  );
  const draft = useTimeEntryCorrectionDraft(day);
  const hasPending = corrections.some(({ status }) => status === 'PENDING');

  async function submit() {
    if (await onSubmit(draft.proposedEntries)) onClose();
  }

  async function decide(id: string, status: 'APPROVED' | 'REJECTED') {
    if (await onDecision(id, status)) onClose();
  }

  return (
    <Dialog isOpen labelledBy="correction-title" onClose={onClose}>
      <DialogTitle id="correction-title">
        <span className="capitalize">Correções de {formatBusinessDayKey(day.dayKey)}</span>
      </DialogTitle>
      {!isReadOnly && (
        <div className="mt-5">
          <SegmentedControl
            onChange={setTab}
            options={[
              { label: 'Correção', value: 'CORRECTION' },
              { label: 'Histórico', value: 'HISTORY' },
            ]}
            value={tab}
          />
        </div>
      )}

      {tab === 'CORRECTION' && (
        <TimeEntryCorrectionEditor
          drafts={draft.drafts}
          hasPending={hasPending}
          isSubmitting={isSubmitting}
          onAdd={draft.add}
          onRemove={draft.remove}
          onUpdateTime={(draftId, time) => {
            draft.update(draftId, (current) => ({ ...current, time }));
          }}
        />
      )}

      {tab === 'HISTORY' && (
        <TimeEntryCorrectionHistory
          canDecide={canApplyDirectly && !isReadOnly}
          corrections={corrections}
          isSubmitting={isSubmitting}
          onDecision={(id, status) => {
            void decide(id, status);
          }}
        />
      )}

      {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
      <DialogActions>
        <Button disabled={isSubmitting} onClick={onClose} type="button" variant="secondary">
          {tab === 'CORRECTION' ? 'Cancelar' : 'Fechar'}
        </Button>
        {tab === 'CORRECTION' && (
          <Button
            disabled={isSubmitting || hasPending || draft.hasIncompleteEntry || draft.isUnchanged}
            onClick={() => {
              void submit();
            }}
            type="button"
          >
            {canApplyDirectly ? 'Aplicar correção' : 'Enviar correção'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
