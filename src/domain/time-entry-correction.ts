export type TimeEntryCorrectionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface CorrectionEntry {
  timeEntryId: string | null;
  recordedAt: Date;
}

export interface TimeEntryCorrection {
  id: string;
  userId: string;
  dayKey: string;
  monthKey: string;
  status: TimeEntryCorrectionStatus;
  previousEntries: CorrectionEntry[];
  proposedEntries: CorrectionEntry[];
  requestedById: string;
  requestedAt: Date;
  decidedById: string | null;
  decidedAt: Date | null;
}
