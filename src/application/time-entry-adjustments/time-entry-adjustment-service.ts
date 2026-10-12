import { getBusinessDateKeys } from '@/application/time-entries/business-time';
import type { TimeEntryRepository } from '@/application/time-entries/time-entry-repository';
import { MAX_DAILY_TIME_ENTRIES } from '@/application/time-entries/time-entry-service';
import type {
  NewTimeEntryAdjustment,
  TimeEntryAdjustmentRepository,
} from '@/application/time-entry-adjustments/time-entry-adjustment-repository';
import type { TimePeriodRepository } from '@/application/time-periods/time-period-repository';
import type { TimeEntryAdjustment } from '@/domain/time-entry-adjustment';

interface RequestAdditionInput {
  proposedRecordedAt: Date;
  requestedById: string;
  userId: string;
}

interface RequestChangeInput extends RequestAdditionInput {
  timeEntryId: string;
}

interface RequestRemovalInput {
  requestedById: string;
  timeEntryId: string;
  userId: string;
}

export class ClosedTimePeriodError extends Error {
  constructor() {
    super('Time period is closed.');
    this.name = 'ClosedTimePeriodError';
  }
}

export class TimeEntryAdjustmentConflictError extends Error {
  constructor() {
    super('Time entry already has a pending adjustment.');
    this.name = 'TimeEntryAdjustmentConflictError';
  }
}

export class TimeEntryAdjustmentLimitError extends Error {
  constructor() {
    super('Adjustment would exceed the daily time entry limit.');
    this.name = 'TimeEntryAdjustmentLimitError';
  }
}

export class TimeEntryNotAdjustableError extends Error {
  constructor() {
    super('Time entry cannot be adjusted.');
    this.name = 'TimeEntryNotAdjustableError';
  }
}

function approvedAdjustments(adjustments: TimeEntryAdjustment[]) {
  return adjustments
    .filter(
      (adjustment): adjustment is TimeEntryAdjustment & { decidedAt: Date } =>
        adjustment.status === 'APPROVED' && adjustment.decidedAt !== null,
    )
    .sort((left, right) => left.decidedAt.getTime() - right.decidedAt.getTime());
}

function resolveCurrentRecordedAt(
  recordedAt: Date,
  adjustments: TimeEntryAdjustment[],
): Date | null {
  let currentRecordedAt: Date | null = recordedAt;

  for (const adjustment of approvedAdjustments(adjustments)) {
    if (adjustment.type === 'CHANGE') currentRecordedAt = adjustment.proposedRecordedAt;
    if (adjustment.type === 'REMOVE') currentRecordedAt = null;
  }

  return currentRecordedAt;
}

function hasPendingAdjustment(adjustments: TimeEntryAdjustment[]) {
  return adjustments.some((adjustment) => adjustment.status === 'PENDING');
}

function countEffectiveEntries(originalCount: number, adjustments: TimeEntryAdjustment[]) {
  return approvedAdjustments(adjustments).reduce((count, adjustment) => {
    if (adjustment.type === 'ADD') return count + 1;
    if (adjustment.type === 'REMOVE') return count - 1;
    return count;
  }, originalCount);
}

export class TimeEntryAdjustmentService {
  private readonly adjustmentRepository: TimeEntryAdjustmentRepository;
  private readonly periodRepository: TimePeriodRepository;
  private readonly timeEntryRepository: TimeEntryRepository;

  constructor(
    adjustmentRepository: TimeEntryAdjustmentRepository,
    periodRepository: TimePeriodRepository,
    timeEntryRepository: TimeEntryRepository,
  ) {
    this.adjustmentRepository = adjustmentRepository;
    this.periodRepository = periodRepository;
    this.timeEntryRepository = timeEntryRepository;
  }

  async requestAddition(input: RequestAdditionInput) {
    const { dayKey, monthKey } = getBusinessDateKeys(input.proposedRecordedAt);
    await this.ensureOpenPeriod(input.userId, monthKey);

    const [entries, adjustments] = await Promise.all([
      this.timeEntryRepository.findByUserAndDay(input.userId, dayKey),
      this.adjustmentRepository.findByUserAndDay(input.userId, dayKey),
    ]);

    if (countEffectiveEntries(entries.length, adjustments) >= MAX_DAILY_TIME_ENTRIES) {
      throw new TimeEntryAdjustmentLimitError();
    }

    return this.adjustmentRepository.create({
      ...input,
      currentRecordedAt: null,
      dayKey,
      monthKey,
      targetTimeEntryId: null,
      type: 'ADD',
    });
  }

  requestChange(input: RequestChangeInput) {
    return this.requestForTimeEntry(input, 'CHANGE', input.proposedRecordedAt);
  }

  requestRemoval(input: RequestRemovalInput) {
    return this.requestForTimeEntry(input, 'REMOVE', null);
  }

  private async ensureOpenPeriod(userId: string, monthKey: string) {
    if (await this.periodRepository.isClosed(userId, monthKey)) {
      throw new ClosedTimePeriodError();
    }
  }

  private async requestForTimeEntry(
    input: RequestChangeInput | RequestRemovalInput,
    type: 'CHANGE' | 'REMOVE',
    proposedRecordedAt: Date | null,
  ) {
    const entry = await this.timeEntryRepository.findById(input.timeEntryId);

    if (entry?.userId !== input.userId) throw new TimeEntryNotAdjustableError();

    await this.ensureOpenPeriod(input.userId, entry.monthKey);
    const adjustments = await this.adjustmentRepository.findByTimeEntryId(entry.id);

    if (hasPendingAdjustment(adjustments)) throw new TimeEntryAdjustmentConflictError();

    const currentRecordedAt = resolveCurrentRecordedAt(entry.recordedAt, adjustments);

    if (!currentRecordedAt) throw new TimeEntryNotAdjustableError();

    const adjustment: NewTimeEntryAdjustment = {
      currentRecordedAt,
      dayKey: entry.dayKey,
      monthKey: entry.monthKey,
      proposedRecordedAt,
      requestedById: input.requestedById,
      targetTimeEntryId: entry.id,
      type,
      userId: input.userId,
    };

    return this.adjustmentRepository.create(adjustment);
  }
}
