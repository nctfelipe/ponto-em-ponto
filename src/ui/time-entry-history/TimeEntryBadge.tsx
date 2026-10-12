import type { TimeEntry } from '@/domain/time-entry';
import { formatBusinessShortTime } from '@/ui/formatters/business-time';

interface TimeEntryBadgeProps {
  entry: TimeEntry;
}

export function TimeEntryBadge({ entry }: TimeEntryBadgeProps) {
  return (
    <time
      className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700"
      dateTime={entry.recordedAt.toISOString()}
    >
      {formatBusinessShortTime(entry.recordedAt)}
    </time>
  );
}
