import { useEffect, useRef, useState } from 'react';
import type { MonthlyTimeEntryDay } from '@/application/time-entries/time-entry-service';
import type { TimeEntryAdjustmentCommand } from '@/application/time-entry-adjustments/time-entry-adjustment-service';
import type { TimeEntry } from '@/domain/time-entry';
import type { TimeEntryAdjustment } from '@/domain/time-entry-adjustment';
import { Alert } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import { InputField } from '@/ui/components/InputField';
import {
  formatBusinessDayKey,
  formatBusinessTimeInput,
  parseBusinessDayAndTime,
} from '@/ui/formatters/business-time';
import { TimeEntryAdjustmentHistory } from '@/ui/time-entry-history/TimeEntryAdjustmentHistory';

interface TimeEntryAdjustmentDialogProps {
  adjustments: TimeEntryAdjustment[];
  day: MonthlyTimeEntryDay;
  errorMessage: string | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (requests: TimeEntryAdjustmentCommand[]) => Promise<boolean>;
}

interface DraftEntry {
  entry: TimeEntry | null;
  id: string;
  isRemoved: boolean;
  time: string;
}

function createDraftEntry(entry: TimeEntry): DraftEntry {
  return {
    entry,
    id: entry.id,
    isRemoved: false,
    time: formatBusinessTimeInput(entry.recordedAt),
  };
}

export function TimeEntryAdjustmentDialog({
  adjustments,
  day,
  errorMessage,
  isSubmitting,
  onCancel,
  onSubmit,
}: TimeEntryAdjustmentDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nextDraftId = useRef(0);
  const [draftEntries, setDraftEntries] = useState(() => day.entries.map(createDraftEntry));
  const pendingTargetIds = new Set(
    adjustments.flatMap((adjustment) =>
      adjustment.status === 'PENDING' && adjustment.targetTimeEntryId
        ? [adjustment.targetTimeEntryId]
        : [],
    ),
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  function updateDraft(id: string, update: (draft: DraftEntry) => DraftEntry) {
    setDraftEntries((current) => current.map((draft) => (draft.id === id ? update(draft) : draft)));
  }

  function addDraft() {
    const id = `new-${String(nextDraftId.current)}`;
    nextDraftId.current += 1;
    setDraftEntries((current) => [...current, { entry: null, id, isRemoved: false, time: '' }]);
  }

  function removeDraft(draft: DraftEntry) {
    if (!draft.entry) {
      setDraftEntries((current) => current.filter(({ id }) => id !== draft.id));
      return;
    }

    updateDraft(draft.id, (current) => ({ ...current, isRemoved: !current.isRemoved }));
  }

  function createRequests() {
    return draftEntries.flatMap<TimeEntryAdjustmentCommand>((draft) => {
      if (draft.entry && draft.isRemoved) {
        return [{ timeEntryId: draft.entry.id, type: 'REMOVE' }];
      }

      if (draft.isRemoved || !draft.time) return [];

      const proposedRecordedAt = parseBusinessDayAndTime(day.dayKey, draft.time);

      if (!draft.entry) return [{ proposedRecordedAt, type: 'ADD' }];
      if (draft.time !== formatBusinessTimeInput(draft.entry.recordedAt)) {
        return [{ proposedRecordedAt, timeEntryId: draft.entry.id, type: 'CHANGE' }];
      }

      return [];
    });
  }

  const requests = createRequests();
  const hasIncompleteEntry = draftEntries.some((draft) => !draft.isRemoved && !draft.time);

  async function submit() {
    if (requests.length > 0 && (await onSubmit(requests))) onCancel();
  }

  return (
    <dialog
      aria-labelledby="adjustment-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-surface p-6 shadow-xl backdrop:bg-content/50"
      onCancel={onCancel}
      ref={dialogRef}
    >
      <h2 className="text-xl font-semibold capitalize text-content" id="adjustment-title">
        Ajustes de {formatBusinessDayKey(day.dayKey)}
      </h2>
      <p className="mt-2 text-sm text-content-secondary">
        Revise as alterações antes de enviar as solicitações.
      </p>

      <div className="mt-5 space-y-3">
        {draftEntries.length === 0 && (
          <p className="text-sm text-content-muted">Nenhuma batida registrada.</p>
        )}

        {draftEntries.map((draft, index) => (
          <div
            className={`flex items-end gap-3 rounded-lg border border-border p-3 ${draft.isRemoved ? 'bg-danger-subtle opacity-70' : ''}`}
            key={draft.id}
          >
            <InputField
              disabled={
                draft.isRemoved ||
                isSubmitting ||
                (draft.entry ? pendingTargetIds.has(draft.entry.id) : false)
              }
              label={draft.entry ? `Batida ${String(index + 1)}` : 'Nova batida'}
              onChange={(event) => {
                updateDraft(draft.id, (current) => ({ ...current, time: event.target.value }));
              }}
              required
              type="time"
              value={draft.time}
            />
            <Button
              disabled={
                isSubmitting || (draft.entry ? pendingTargetIds.has(draft.entry.id) : false)
              }
              onClick={() => {
                removeDraft(draft);
              }}
              size="small"
              type="button"
              variant={draft.isRemoved ? 'secondary' : 'danger'}
            >
              {draft.entry && pendingTargetIds.has(draft.entry.id)
                ? 'Pendente'
                : draft.isRemoved
                  ? 'Desfazer'
                  : draft.entry
                    ? 'Remover'
                    : 'Descartar'}
            </Button>
          </div>
        ))}
      </div>

      <Button
        className="mt-4"
        disabled={isSubmitting}
        onClick={addDraft}
        type="button"
        variant="secondary"
      >
        Adicionar batida
      </Button>

      {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

      <TimeEntryAdjustmentHistory adjustments={adjustments} />

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button disabled={isSubmitting} onClick={onCancel} type="button" variant="secondary">
          Cancelar
        </Button>
        <Button
          disabled={isSubmitting || hasIncompleteEntry || requests.length === 0}
          onClick={() => void submit()}
          type="button"
        >
          {isSubmitting ? 'Enviando...' : 'Confirmar ajustes'}
        </Button>
      </div>
    </dialog>
  );
}
