import { useEffect, useRef, useState } from 'react';
import type { MonthlyTimeEntryDay } from '@/application/time-entries/time-entry-service';
import type { TimeEntry } from '@/domain/time-entry';
import { Alert } from '@/ui/components/Alert';
import { Badge } from '@/ui/components/Badge';
import { Button } from '@/ui/components/Button';
import { InputField } from '@/ui/components/InputField';
import {
  formatBusinessDayKey,
  formatBusinessShortTime,
  formatBusinessTimeInput,
  parseBusinessDayAndTime,
} from '@/ui/formatters/business-time';

interface TimeEntryAdjustmentDialogProps {
  day: MonthlyTimeEntryDay;
  errorMessage: string | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onChange: (entryId: string, proposedRecordedAt: Date) => Promise<boolean>;
  onCreate: (proposedRecordedAt: Date) => Promise<boolean>;
  onRemove: (entryId: string) => Promise<boolean>;
}

type Editor = { entry: TimeEntry; type: 'CHANGE' } | { type: 'ADD' } | null;

export function TimeEntryAdjustmentDialog({
  day,
  errorMessage,
  isSubmitting,
  onCancel,
  onChange,
  onCreate,
  onRemove,
}: TimeEntryAdjustmentDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [editor, setEditor] = useState<Editor>(null);
  const [time, setTime] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  function edit(entry: TimeEntry) {
    setEditor({ entry, type: 'CHANGE' });
    setTime(formatBusinessTimeInput(entry.recordedAt));
  }

  function add() {
    setEditor({ type: 'ADD' });
    setTime('');
  }

  async function submit() {
    if (!editor) return;

    const proposedRecordedAt = parseBusinessDayAndTime(day.dayKey, time);
    const succeeded =
      editor.type === 'CHANGE'
        ? await onChange(editor.entry.id, proposedRecordedAt)
        : await onCreate(proposedRecordedAt);

    if (succeeded) onCancel();
  }

  async function remove(entryId: string) {
    if (await onRemove(entryId)) onCancel();
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

      <div className="mt-5 space-y-3">
        {day.entries.length === 0 && (
          <p className="text-sm text-content-muted">Nenhuma batida registrada.</p>
        )}

        {day.entries.map((entry) => (
          <div
            className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
            key={entry.id}
          >
            <Badge>
              <time dateTime={entry.recordedAt.toISOString()}>
                {formatBusinessShortTime(entry.recordedAt)}
              </time>
            </Badge>
            <div className="flex gap-2">
              <Button
                disabled={isSubmitting}
                onClick={() => {
                  edit(entry);
                }}
                size="small"
                type="button"
                variant="secondary"
              >
                Alterar
              </Button>
              <Button
                disabled={isSubmitting}
                onClick={() => void remove(entry.id)}
                size="small"
                type="button"
                variant="danger"
              >
                Remover
              </Button>
            </div>
          </div>
        ))}
      </div>

      {editor && (
        <div className="mt-5 space-y-4 rounded-lg bg-background p-4">
          <InputField
            disabled={isSubmitting}
            label={editor.type === 'ADD' ? 'Horário da nova batida' : 'Novo horário'}
            onChange={(event) => {
              setTime(event.target.value);
            }}
            required
            type="time"
            value={time}
          />
          <div className="flex justify-end gap-3">
            <Button
              disabled={isSubmitting}
              onClick={() => {
                setEditor(null);
              }}
              size="small"
              type="button"
              variant="secondary"
            >
              Cancelar
            </Button>
            <Button
              disabled={isSubmitting || !time}
              onClick={() => void submit()}
              size="small"
              type="button"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar solicitação'}
            </Button>
          </div>
        </div>
      )}

      {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

      <div className="mt-6 flex justify-between gap-3">
        <Button disabled={isSubmitting} onClick={onCancel} type="button" variant="secondary">
          Fechar
        </Button>
        <Button disabled={isSubmitting} onClick={add} type="button">
          Adicionar batida
        </Button>
      </div>
    </dialog>
  );
}
