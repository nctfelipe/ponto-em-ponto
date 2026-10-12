import { useEffect, useRef, useState } from 'react';
import type { TimeEntry } from '@/domain/time-entry';
import { Alert } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import { InputField } from '@/ui/components/InputField';
import {
  formatBusinessDateTimeInput,
  parseBusinessDateTimeInput,
} from '@/ui/formatters/business-time';

interface TimeEntryAdjustmentDialogProps {
  entry: TimeEntry | null;
  errorMessage: string | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onChange: (entryId: string, proposedRecordedAt: Date) => Promise<boolean>;
  onCreate: (proposedRecordedAt: Date) => Promise<boolean>;
  onRemove: (entryId: string) => Promise<boolean>;
}

export function TimeEntryAdjustmentDialog({
  entry,
  errorMessage,
  isSubmitting,
  onCancel,
  onChange,
  onCreate,
  onRemove,
}: TimeEntryAdjustmentDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [dateTime, setDateTime] = useState(() =>
    formatBusinessDateTimeInput(entry?.recordedAt ?? new Date()),
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  async function submit() {
    const proposedRecordedAt = parseBusinessDateTimeInput(dateTime);
    const succeeded = entry
      ? await onChange(entry.id, proposedRecordedAt)
      : await onCreate(proposedRecordedAt);
    if (succeeded) onCancel();
  }

  async function remove() {
    if (!entry) return;
    if (await onRemove(entry.id)) onCancel();
  }

  return (
    <dialog
      aria-labelledby="adjustment-title"
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-surface p-6 shadow-xl backdrop:bg-content/50"
      onCancel={onCancel}
      ref={dialogRef}
    >
      <h2 className="text-xl font-semibold text-content" id="adjustment-title">
        {entry ? 'Ajustar batida' : 'Adicionar batida'}
      </h2>

      <div className="mt-5 space-y-4">
        <InputField
          disabled={isSubmitting}
          label="Data e horário"
          onChange={(event) => {
            setDateTime(event.target.value);
          }}
          required
          type="datetime-local"
          value={dateTime}
        />
        {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        {entry && (
          <Button
            disabled={isSubmitting}
            onClick={() => void remove()}
            type="button"
            variant="danger"
          >
            Remover
          </Button>
        )}
        <Button disabled={isSubmitting} onClick={onCancel} type="button" variant="secondary">
          Cancelar
        </Button>
        <Button disabled={isSubmitting || !dateTime} onClick={() => void submit()} type="button">
          {isSubmitting ? 'Enviando...' : 'Enviar solicitação'}
        </Button>
      </div>
    </dialog>
  );
}
