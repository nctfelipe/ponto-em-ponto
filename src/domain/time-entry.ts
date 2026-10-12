export type TimeEntryStatus = 'ACTIVE' | 'REMOVED';

export interface TimeEntry {
  id: string;
  userId: string;
  recordedAt: Date;
  dayKey: string;
  monthKey: string;
  status: TimeEntryStatus;
}
