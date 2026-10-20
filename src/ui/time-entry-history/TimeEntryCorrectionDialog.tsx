import { useEffect, useRef, useState } from 'react';
import type { MonthlyTimeEntryDay } from '@/application/time-entries/time-entry-service';
import type { CorrectionEntry, TimeEntryCorrection } from '@/domain/time-entry-correction';
import type { TimeEntry } from '@/domain/time-entry';
import { Alert } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import { InputField } from '@/ui/components/InputField';
import { SegmentedControl } from '@/ui/components/SegmentedControl';
import {
  formatBusinessDayKey,
  formatBusinessTimeInput,
  parseBusinessDayAndTime,
} from '@/ui/formatters/business-time';
import { TimeEntryCorrectionHistory } from '@/ui/time-entry-history/TimeEntryCorrectionHistory';

interface Props {
  canApplyDirectly: boolean;
  corrections: TimeEntryCorrection[];
  day: MonthlyTimeEntryDay;
  errorMessage: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onDecision: (id: string, status: 'APPROVED' | 'REJECTED') => Promise<boolean>;
  onSubmit: (entries: CorrectionEntry[]) => Promise<boolean>;
}

interface DraftEntry {
  entry: TimeEntry | null;
  id: string;
  removed: boolean;
  time: string;
}

type DialogTab = 'CORRECTION' | 'HISTORY';

export function TimeEntryCorrectionDialog({
  canApplyDirectly,
  corrections,
  day,
  errorMessage,
  isSubmitting,
  onClose,
  onDecision,
  onSubmit,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nextId = useRef(0);
  const [tab, setTab] = useState<DialogTab>(
    corrections.some(({ status }) => status === 'PENDING') ? 'HISTORY' : 'CORRECTION',
  );
  const [drafts, setDrafts] = useState<DraftEntry[]>(() =>
    day.entries.map((entry) => ({
      entry,
      id: entry.id,
      removed: false,
      time: formatBusinessTimeInput(entry.recordedAt),
    })),
  );
  const hasPending = corrections.some(({ status }) => status === 'PENDING');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  function updateDraft(id: string, update: (draft: DraftEntry) => DraftEntry) {
    setDrafts((current) => current.map((draft) => (draft.id === id ? update(draft) : draft)));
  }

  function addDraft() {
    const id = `new-${String(nextId.current++)}`;
    setDrafts((current) => [...current, { entry: null, id, removed: false, time: '' }]);
  }

  function removeDraft(draft: DraftEntry) {
    if (!draft.entry) {
      setDrafts((current) => current.filter(({ id }) => id !== draft.id));
    } else {
      updateDraft(draft.id, (current) => ({ ...current, removed: !current.removed }));
    }
  }

  const proposedEntries = drafts.flatMap<CorrectionEntry>((draft) => {
    if (draft.removed || !draft.time) return [];
    return [
      {
        recordedAt: parseBusinessDayAndTime(day.dayKey, draft.time),
        timeEntryId: draft.entry?.id ?? null,
      },
    ];
  });
  const hasIncompleteEntry = drafts.some((draft) => !draft.removed && !draft.time);
  const proposedFingerprint = proposedEntries
    .map(({ recordedAt, timeEntryId }) => `${timeEntryId ?? 'new'}:${String(recordedAt.getTime())}`)
    .join('|');
  const currentFingerprint = day.entries
    .map(({ id, recordedAt }) => `${id}:${String(recordedAt.getTime())}`)
    .join('|');
  const unchanged = proposedFingerprint === currentFingerprint;

  async function submit() {
    if (await onSubmit(proposedEntries)) onClose();
  }

  async function decide(id: string, status: 'APPROVED' | 'REJECTED') {
    if (await onDecision(id, status)) onClose();
  }

  return (
    <dialog
      aria-labelledby="correction-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-surface p-6 shadow-xl backdrop:bg-content/50"
      onCancel={onClose}
      ref={dialogRef}
    >
      <h2 className="text-xl font-semibold capitalize text-content" id="correction-title">
        Correções de {formatBusinessDayKey(day.dayKey)}
      </h2>
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

      {tab === 'CORRECTION' && (
        <>
          {hasPending && <Alert>Analise a correção pendente antes de criar outra.</Alert>}
          <div className="mt-5 space-y-3">
            {drafts.map((draft, index) => (
              <div
                className={`flex items-end gap-3 rounded-lg border border-border p-3 ${draft.removed ? 'bg-danger-subtle opacity-70' : ''}`}
                key={draft.id}
              >
                <InputField
                  disabled={draft.removed || isSubmitting || hasPending}
                  label={draft.entry ? `Batida ${String(index + 1)}` : 'Nova batida'}
                  onChange={(event) => {
                    updateDraft(draft.id, (current) => ({ ...current, time: event.target.value }));
                  }}
                  required
                  type="time"
                  value={draft.time}
                />
                <Button
                  disabled={isSubmitting || hasPending}
                  onClick={() => {
                    removeDraft(draft);
                  }}
                  size="small"
                  type="button"
                  variant={draft.removed ? 'secondary' : 'danger'}
                >
                  {draft.removed ? 'Desfazer' : draft.entry ? 'Remover' : 'Descartar'}
                </Button>
              </div>
            ))}
          </div>
          <Button
            className="mt-4"
            disabled={isSubmitting || hasPending}
            onClick={addDraft}
            type="button"
            variant="secondary"
          >
            Adicionar batida
          </Button>
        </>
      )}

      {tab === 'HISTORY' && (
        <TimeEntryCorrectionHistory
          canDecide={canApplyDirectly}
          corrections={corrections}
          isSubmitting={isSubmitting}
          onDecision={(id, status) => {
            void decide(id, status);
          }}
        />
      )}

      {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
      <div className="mt-6 flex justify-end gap-3">
        <Button disabled={isSubmitting} onClick={onClose} type="button" variant="secondary">
          {tab === 'CORRECTION' ? 'Cancelar' : 'Fechar'}
        </Button>
        {tab === 'CORRECTION' && (
          <Button
            disabled={isSubmitting || hasPending || hasIncompleteEntry || unchanged}
            onClick={() => {
              void submit();
            }}
            type="button"
          >
            {canApplyDirectly ? 'Aplicar correção' : 'Enviar correção'}
          </Button>
        )}
      </div>
    </dialog>
  );
}
