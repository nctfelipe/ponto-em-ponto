import { MAX_DAILY_TIME_ENTRIES } from '@/application/time-entries/register-time-entry';
import { Button } from '@/ui/components/Button';

interface TimeClockCardProps {
  canRecord: boolean;
  currentDateLabel: string;
  entryCount: number;
  isRegistering: boolean;
  onRequestRecord: () => void;
}

export function TimeClockCard({
  canRecord,
  currentDateLabel,
  entryCount,
  isRegistering,
  onRequestRecord,
}: TimeClockCardProps) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
      <p className="text-sm font-medium text-slate-600 first-letter:uppercase">
        {currentDateLabel}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        {entryCount} de {MAX_DAILY_TIME_ENTRIES} batidas registradas
      </p>
      <Button
        className="mt-6 w-full"
        disabled={!canRecord || isRegistering}
        onClick={onRequestRecord}
        size="large"
        type="button"
      >
        {canRecord ? 'Registrar ponto' : 'Limite diário atingido'}
      </Button>
    </section>
  );
}
