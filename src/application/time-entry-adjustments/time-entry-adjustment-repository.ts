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
  applyMany(adjustments: NewTimeEntryAdjustment[], decidedById: string): Promise<void>;
  approve(adjustment: TimeEntryAdjustment, decidedById: string): Promise<void>;
  createMany(adjustments: NewTimeEntryAdjustment[]): Promise<void>;
  findById(id: string): Promise<TimeEntryAdjustment | null>;
  findByTimeEntryId(timeEntryId: string): Promise<TimeEntryAdjustment[]>;
  findByUserAndMonth(userId: string, monthKey: string): Promise<TimeEntryAdjustment[]>;
  reject(id: string, decidedById: string): Promise<void>;
}

export class TimeEntryAdjustmentRepositoryError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'TimeEntryAdjustmentRepositoryError';
  }
}
