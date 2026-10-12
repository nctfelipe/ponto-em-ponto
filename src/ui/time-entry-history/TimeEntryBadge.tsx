import type { TimeEntry } from '@/domain/time-entry';
import { Badge } from '@/ui/components/Badge';
import { formatBusinessShortTime } from '@/ui/formatters/business-time';

interface TimeEntryBadgeProps {
  entry: TimeEntry;
  onAdjust?: ((entry: TimeEntry) => void) | undefined;
}

export function TimeEntryBadge({ entry, onAdjust }: TimeEntryBadgeProps) {
  const time = formatBusinessShortTime(entry.recordedAt);

  if (onAdjust) {
    return (
      <button
        aria-label={`Ajustar batida das ${time}`}
        className="rounded-full transition hover:brightness-90 focus:outline-none focus:ring-3 focus:ring-primary/20"
        onClick={() => {
          onAdjust(entry);
        }}
        type="button"
      >
        <Badge>
          <time dateTime={entry.recordedAt.toISOString()}>{time}</time>
        </Badge>
      </button>
    );
  }

  return (
    <Badge>
      <time dateTime={entry.recordedAt.toISOString()}>{time}</time>
    </Badge>
  );
}
