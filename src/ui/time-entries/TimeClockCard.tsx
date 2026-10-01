import type { TimeEntry } from '@/domain/time-entry';
import { LiveTimeEntryButton } from '@/ui/time-entries/LiveTimeEntryButton';
import { TimeEntryTimeline } from '@/ui/time-entries/TimeEntryTimeline';

interface TimeClockCardProps {
  canRecord: boolean;
  currentDateLabel: string;
  entries: TimeEntry[];
  isRegistering: boolean;
  onRequestRecord: () => void;
}

export function TimeClockCard({
  canRecord,
  currentDateLabel,
  entries,
  isRegistering,
  onRequestRecord,
}: TimeClockCardProps) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
      <p className="text-sm font-medium text-slate-600 first-letter:uppercase">
        {currentDateLabel}
      </p>
      <TimeEntryTimeline entries={entries} />
      <LiveTimeEntryButton
        isAvailable={canRecord}
        isRegistering={isRegistering}
        onClick={onRequestRecord}
      />
    </section>
  );
}
