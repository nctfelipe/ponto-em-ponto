export type TimeEntryAdjustmentType = 'ADD' | 'CHANGE' | 'REMOVE';
export type TimeEntryAdjustmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface TimeEntryAdjustment {
  id: string;
  userId: string;
  requestedById: string;
  type: TimeEntryAdjustmentType;
  status: TimeEntryAdjustmentStatus;
  targetTimeEntryId: string | null;
  currentRecordedAt: Date | null;
  proposedRecordedAt: Date | null;
  dayKey: string;
  monthKey: string;
  requestedAt: Date;
  decidedAt: Date | null;
  decidedById: string | null;
}
