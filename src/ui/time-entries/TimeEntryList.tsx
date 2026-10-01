import { formatBusinessTime } from '@/application/time-entries/business-time';
import type { TimeEntry } from '@/domain/time-entry';

interface TimeEntryListProps {
  entries: TimeEntry[];
}

export function TimeEntryList({ entries }: TimeEntryListProps) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
      <h2 className="font-semibold text-slate-950">Hoje</h2>
      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">Nenhuma batida registrada.</p>
      ) : (
        <ol
          aria-label="Cronologia das batidas de hoje"
          className="mt-4 flex gap-3 overflow-x-auto pb-2"
        >
          {entries.map((entry) => (
            <li className="flex-none" key={entry.id}>
              <time
                className="grid size-20 place-items-center rounded-full bg-blue-50 text-sm font-semibold tabular-nums text-blue-700 ring-1 ring-blue-100"
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
