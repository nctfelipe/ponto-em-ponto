import { Alert } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import { InputField } from '@/ui/components/InputField';
import type { TimeEntryCorrectionDraft } from '@/ui/time-entry-history/useTimeEntryCorrectionDraft';

interface TimeEntryCorrectionEditorProps {
  drafts: TimeEntryCorrectionDraft[];
  hasPending: boolean;
  isSubmitting: boolean;
  onAdd: () => void;
  onRemove: (draft: TimeEntryCorrectionDraft) => void;
  onUpdateTime: (draftId: string, time: string) => void;
}

export function TimeEntryCorrectionEditor({
  drafts,
  hasPending,
  isSubmitting,
  onAdd,
  onRemove,
  onUpdateTime,
}: TimeEntryCorrectionEditorProps) {
  return (
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
                onUpdateTime(draft.id, event.target.value);
              }}
              required
              type="time"
              value={draft.time}
            />
            <Button
              disabled={isSubmitting || hasPending}
              onClick={() => {
                onRemove(draft);
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
        onClick={onAdd}
        type="button"
        variant="secondary"
      >
        Adicionar batida
      </Button>
    </>
  );
}
