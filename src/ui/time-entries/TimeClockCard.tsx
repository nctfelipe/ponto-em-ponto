import type { TimeEntry } from '@/domain/time-entry';
import { LiveTimeEntryButton } from '@/ui/time-entries/LiveTimeEntryButton';
import { TimeEntryTimeline } from '@/ui/time-entries/TimeEntryTimeline';

interface TimeClockCardProps {
  canRecord: boolean;
  currentDateLabel: string;
  entries: TimeEntry[];
  isRegistering: boolean;
  isPeriodClosed: boolean;
  onRequestRecord: () => void;
}

export function TimeClockCard({
  canRecord,
  currentDateLabel,
  entries,
  isRegistering,
  isPeriodClosed,
  onRequestRecord,
}: TimeClockCardProps) {
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-border sm:p-6">
      <p className="text-sm font-medium text-content-secondary first-letter:uppercase">
        {currentDateLabel}
      </p>
      <TimeEntryTimeline entries={entries} />
      <LiveTimeEntryButton
        isAvailable={canRecord}
        isPeriodClosed={isPeriodClosed}
        isRegistering={isRegistering}
        onClick={onRequestRecord}
      />
    </section>
  );
}
