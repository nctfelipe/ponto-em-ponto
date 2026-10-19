import type { TimeEntry } from '@/domain/time-entry';
import { Badge } from '@/ui/components/Badge';
import { formatBusinessShortTime } from '@/ui/formatters/business-time';

interface TimeEntryBadgeProps {
  entry: TimeEntry;
  hasPendingAdjustment?: boolean;
}

export function TimeEntryBadge({ entry, hasPendingAdjustment = false }: TimeEntryBadgeProps) {
  const time = formatBusinessShortTime(entry.recordedAt);

  return (
    <span title={hasPendingAdjustment ? 'Solicitação pendente' : undefined}>
      <Badge variant={hasPendingAdjustment ? 'warning' : 'neutral'}>
        <time dateTime={entry.recordedAt.toISOString()}>{time}</time>
      </Badge>
    </span>
  );
}
