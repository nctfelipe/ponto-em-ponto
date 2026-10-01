import { formatBusinessShortTime } from '@/application/time-entries/business-time';
import type { TimeEntry } from '@/domain/time-entry';

interface TimeEntryTimelineProps {
  entries: TimeEntry[];
}

export function TimeEntryTimeline({ entries }: TimeEntryTimelineProps) {
  const slotCount = Math.max(4, entries.length);

  return (
    <ol
      aria-label="Cronologia das batidas de hoje"
      className="my-5 flex w-full justify-center gap-2"
    >
      {Array.from({ length: slotCount }, (_, index) => {
        const entry = entries[index];

        return (
          <li
            className="aspect-square min-w-0 max-w-16 flex-1"
            key={entry?.id ?? `empty-${String(index)}`}
          >
            {entry ? (
              <time
                className="grid size-full place-items-center rounded-full bg-blue-50 font-semibold tabular-nums text-blue-700 ring-1 ring-blue-100 text-[clamp(0.625rem,2.75vw,0.875rem)]"
                dateTime={entry.recordedAt.toISOString()}
              >
                {formatBusinessShortTime(entry.recordedAt)}
              </time>
            ) : (
              <span
                aria-hidden="true"
                className="block size-full rounded-full bg-slate-100 ring-1 ring-slate-200"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
