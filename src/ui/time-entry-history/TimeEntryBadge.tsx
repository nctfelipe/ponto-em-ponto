import type { TimeEntry } from '@/domain/time-entry';
import { Badge } from '@/ui/components/Badge';
import { formatBusinessShortTime } from '@/ui/formatters/business-time';

interface TimeEntryBadgeProps {
  entry: TimeEntry;
}

export function TimeEntryBadge({ entry }: TimeEntryBadgeProps) {
  return (
    <Badge>
      <time dateTime={entry.recordedAt.toISOString()}>
        {formatBusinessShortTime(entry.recordedAt)}
      </time>
    </Badge>
  );
}
