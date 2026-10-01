import { LiveTimeEntryButton } from '@/ui/time-entries/LiveTimeEntryButton';

interface TimeClockCardProps {
  canRecord: boolean;
  currentDateLabel: string;
  isRegistering: boolean;
  onRequestRecord: () => void;
}

export function TimeClockCard({
  canRecord,
  currentDateLabel,
  isRegistering,
  onRequestRecord,
}: TimeClockCardProps) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
      <p className="text-sm font-medium text-slate-600 first-letter:uppercase">
        {currentDateLabel}
      </p>
      <LiveTimeEntryButton
        isAvailable={canRecord}
        isRegistering={isRegistering}
        onClick={onRequestRecord}
      />
    </section>
  );
}
