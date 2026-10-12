import type { TimeEntry } from '@/domain/time-entry';
import { formatBusinessDay, formatBusinessShortTime } from '@/ui/formatters/business-time';

interface TimeEntryHistoryListProps {
  entries: TimeEntry[];
}

interface DailyTimeEntryGroup {
  dayKey: string;
  date: Date;
  entries: TimeEntry[];
}

function groupByDay(entries: TimeEntry[]) {
  return entries.reduce<DailyTimeEntryGroup[]>((groups, entry) => {
    const currentGroup = groups.at(-1);

    if (currentGroup?.dayKey === entry.dayKey) {
      currentGroup.entries.push(entry);
      return groups;
    }

    groups.push({ dayKey: entry.dayKey, date: entry.recordedAt, entries: [entry] });
    return groups;
  }, []);
}

export function TimeEntryHistoryList({ entries }: TimeEntryHistoryListProps) {
  return (
    <div className="space-y-3">
      {groupByDay(entries).map((group) => (
        <section className="rounded-lg border border-slate-200 bg-white p-4" key={group.dayKey}>
          <h3 className="font-semibold capitalize text-slate-950">
            {formatBusinessDay(group.date)}
          </h3>
          <ol className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {group.entries.map((entry) => (
              <li className="rounded-lg bg-slate-50 px-3 py-2 text-center" key={entry.id}>
                <span className="text-xs text-slate-500">Batida</span>
                <time
                  className="block font-semibold text-slate-950"
                  dateTime={entry.recordedAt.toISOString()}
                >
                  {formatBusinessShortTime(entry.recordedAt)}
                </time>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
