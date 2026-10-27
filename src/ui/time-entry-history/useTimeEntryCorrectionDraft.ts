import { useRef, useState } from 'react';
import type { MonthlyTimeEntryDay } from '@/application/time-entries/time-entry-service';
import type { CorrectionEntry } from '@/domain/time-entry-correction';
import type { TimeEntry } from '@/domain/time-entry';
import { formatBusinessTimeInput, parseBusinessDayAndTime } from '@/ui/formatters/business-time';

export interface TimeEntryCorrectionDraft {
  entry: TimeEntry | null;
  id: string;
  removed: boolean;
  time: string;
}

export function useTimeEntryCorrectionDraft(day: MonthlyTimeEntryDay) {
  const nextId = useRef(0);
  const [drafts, setDrafts] = useState<TimeEntryCorrectionDraft[]>(() =>
    day.entries.map((entry) => ({
      entry,
      id: entry.id,
      removed: false,
      time: formatBusinessTimeInput(entry.recordedAt),
    })),
  );

  function update(
    id: string,
    change: (draft: TimeEntryCorrectionDraft) => TimeEntryCorrectionDraft,
  ) {
    setDrafts((current) => current.map((draft) => (draft.id === id ? change(draft) : draft)));
  }

  function add() {
    const id = `new-${String(nextId.current++)}`;
    setDrafts((current) => [...current, { entry: null, id, removed: false, time: '' }]);
  }

  function remove(draft: TimeEntryCorrectionDraft) {
    if (!draft.entry) {
      setDrafts((current) => current.filter(({ id }) => id !== draft.id));
      return;
    }

    update(draft.id, (current) => ({ ...current, removed: !current.removed }));
  }

  const proposedEntries = drafts.flatMap<CorrectionEntry>((draft) => {
    if (draft.removed || !draft.time) return [];
    return [
      {
        recordedAt: parseBusinessDayAndTime(day.dayKey, draft.time),
        timeEntryId: draft.entry?.id ?? null,
      },
    ];
  });
  const hasIncompleteEntry = drafts.some((draft) => !draft.removed && !draft.time);
  const proposedFingerprint = proposedEntries
    .map(({ recordedAt, timeEntryId }) => `${timeEntryId ?? 'new'}:${String(recordedAt.getTime())}`)
    .join('|');
  const currentFingerprint = day.entries
    .map(({ id, recordedAt }) => `${id}:${String(recordedAt.getTime())}`)
    .join('|');

  return {
    add,
    drafts,
    hasIncompleteEntry,
    isUnchanged: proposedFingerprint === currentFingerprint,
    proposedEntries,
    remove,
    update,
  };
}
