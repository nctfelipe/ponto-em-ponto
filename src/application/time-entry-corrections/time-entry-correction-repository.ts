import type {
  TimeEntryCorrection,
  TimeEntryCorrectionStatus,
} from '@/domain/time-entry-correction';

export type NewTimeEntryCorrection = Omit<
  TimeEntryCorrection,
  'decidedAt' | 'decidedById' | 'id' | 'requestedAt' | 'status'
>;

export interface TimeEntryCorrectionRepository {
  apply(correction: NewTimeEntryCorrection, decidedById: string): Promise<void>;
  create(correction: NewTimeEntryCorrection): Promise<void>;
  decide(
    correction: TimeEntryCorrection,
    status: Exclude<TimeEntryCorrectionStatus, 'PENDING'>,
    decidedById: string,
  ): Promise<void>;
  findById(id: string): Promise<TimeEntryCorrection | null>;
  findByUserAndMonth(userId: string, monthKey: string): Promise<TimeEntryCorrection[]>;
  findPendingByDay(userId: string, dayKey: string): Promise<TimeEntryCorrection | null>;
  findPendingByMonth(monthKey: string): Promise<TimeEntryCorrection[]>;
}

export class TimeEntryCorrectionRepositoryError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'TimeEntryCorrectionRepositoryError';
  }
}
