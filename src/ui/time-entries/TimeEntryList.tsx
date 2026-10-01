import { formatBusinessTime } from '@/application/time-entries/business-time';
import type { TimeEntry } from '@/domain/time-entry';

interface TimeEntryListProps {
  entries: TimeEntry[];
}

export function TimeEntryList({ entries }: TimeEntryListProps) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
      <h2 className="font-semibold text-slate-950">Batidas de hoje</h2>
      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">Nenhuma batida registrada.</p>
      ) : (
        <ol className="mt-4 divide-y divide-slate-200">
          {entries.map((entry, index) => (
            <li className="flex items-center justify-between py-3" key={entry.id}>
              <span className="text-sm text-slate-600">Batida {index + 1}</span>
              <time
                className="font-semibold tabular-nums text-slate-950"
                dateTime={entry.recordedAt.toISOString()}
              >
                {formatBusinessTime(entry.recordedAt)}
              </time>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
