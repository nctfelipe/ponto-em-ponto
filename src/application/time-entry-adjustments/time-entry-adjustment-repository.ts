import type { TimeEntryAdjustment, TimeEntryAdjustmentType } from '@/domain/time-entry-adjustment';

export interface NewTimeEntryAdjustment {
  userId: string;
  requestedById: string;
  type: TimeEntryAdjustmentType;
  targetTimeEntryId: string | null;
  currentRecordedAt: Date | null;
  proposedRecordedAt: Date | null;
  dayKey: string;
  monthKey: string;
}

export interface TimeEntryAdjustmentRepository {
  create(adjustment: NewTimeEntryAdjustment): Promise<TimeEntryAdjustment>;
  findByTimeEntryId(timeEntryId: string): Promise<TimeEntryAdjustment[]>;
}

export class TimeEntryAdjustmentRepositoryError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'TimeEntryAdjustmentRepositoryError';
  }
}
