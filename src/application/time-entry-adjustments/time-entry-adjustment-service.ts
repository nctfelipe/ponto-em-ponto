import { getBusinessDateKeys } from '@/application/time-entries/business-time';
import type { TimeEntryRepository } from '@/application/time-entries/time-entry-repository';
import { MAX_DAILY_TIME_ENTRIES } from '@/application/time-entries/time-entry-service';
import type {
  NewTimeEntryAdjustment,
  TimeEntryAdjustmentRepository,
} from '@/application/time-entry-adjustments/time-entry-adjustment-repository';
import type { TimePeriodRepository } from '@/application/time-periods/time-period-repository';
import type { TimeEntry } from '@/domain/time-entry';
import type { TimeEntryAdjustment } from '@/domain/time-entry-adjustment';

export type TimeEntryAdjustmentCommand =
  | { proposedRecordedAt: Date; type: 'ADD' }
  | { proposedRecordedAt: Date; timeEntryId: string; type: 'CHANGE' }
  | { timeEntryId: string; type: 'REMOVE' };

export interface SubmitTimeEntryAdjustmentsInput {
  commands: TimeEntryAdjustmentCommand[];
  requestedById: string;
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

function hasPendingAdjustment(adjustments: TimeEntryAdjustment[]) {
  return adjustments.some((adjustment) => adjustment.status === 'PENDING');
}

function getTargetIds(commands: TimeEntryAdjustmentCommand[]) {
  return commands.flatMap((command) => (command.type === 'ADD' ? [] : [command.timeEntryId]));
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

  async submitAdjustments(input: SubmitTimeEntryAdjustmentsInput) {
    if (input.commands.length === 0) return;

    const targetIds = getTargetIds(input.commands);
    if (new Set(targetIds).size !== targetIds.length) {
      throw new TimeEntryAdjustmentConflictError();
    }

    const targetEntries = await this.findTargetEntries(targetIds, input.userId);
    await this.ensureTargetsHaveNoPendingAdjustments(targetIds);

    const adjustments = input.commands.map((command) =>
      this.createAdjustment(command, input, targetEntries),
    );

    await this.ensureOpenPeriods(input.userId, adjustments);
    await this.ensureDailyLimits(input.userId, adjustments);
    await this.adjustmentRepository.createMany(adjustments);
  }

  private async findTargetEntries(targetIds: string[], userId: string) {
    const entries = await Promise.all(targetIds.map((id) => this.timeEntryRepository.findById(id)));
    const entriesById = new Map<string, TimeEntry>();

    entries.forEach((entry, index) => {
      if (entry?.userId !== userId || entry.status === 'REMOVED') {
        throw new TimeEntryNotAdjustableError();
      }

      const targetId = targetIds[index];
      if (targetId) entriesById.set(targetId, entry);
    });

    return entriesById;
  }

  private async ensureTargetsHaveNoPendingAdjustments(targetIds: string[]) {
    const adjustmentsByTarget = await Promise.all(
      targetIds.map((id) => this.adjustmentRepository.findByTimeEntryId(id)),
    );

    if (adjustmentsByTarget.some(hasPendingAdjustment)) {
      throw new TimeEntryAdjustmentConflictError();
    }
  }

  private createAdjustment(
    command: TimeEntryAdjustmentCommand,
    input: SubmitTimeEntryAdjustmentsInput,
    targetEntries: Map<string, TimeEntry>,
  ): NewTimeEntryAdjustment {
    if (command.type === 'ADD') {
      const { dayKey, monthKey } = getBusinessDateKeys(command.proposedRecordedAt);
      return {
        currentRecordedAt: null,
        dayKey,
        monthKey,
        proposedRecordedAt: command.proposedRecordedAt,
        requestedById: input.requestedById,
        targetTimeEntryId: null,
        type: command.type,
        userId: input.userId,
      };
    }

    const entry = targetEntries.get(command.timeEntryId);
    if (!entry) throw new TimeEntryNotAdjustableError();

    const proposedRecordedAt = command.type === 'CHANGE' ? command.proposedRecordedAt : null;
    if (proposedRecordedAt) {
      const proposedKeys = getBusinessDateKeys(proposedRecordedAt);
      if (proposedKeys.dayKey !== entry.dayKey) throw new TimeEntryNotAdjustableError();
    }

    return {
      currentRecordedAt: entry.recordedAt,
      dayKey: entry.dayKey,
      monthKey: entry.monthKey,
      proposedRecordedAt,
      requestedById: input.requestedById,
      targetTimeEntryId: entry.id,
      type: command.type,
      userId: input.userId,
    };
  }

  private async ensureOpenPeriods(userId: string, adjustments: NewTimeEntryAdjustment[]) {
    const monthKeys = [...new Set(adjustments.map(({ monthKey }) => monthKey))];
    const results = await Promise.all(
      monthKeys.map((monthKey) => this.periodRepository.isClosed(userId, monthKey)),
    );

    if (results.some(Boolean)) throw new ClosedTimePeriodError();
  }

  private async ensureDailyLimits(userId: string, adjustments: NewTimeEntryAdjustment[]) {
    const dayKeys = [...new Set(adjustments.map(({ dayKey }) => dayKey))];

    await Promise.all(
      dayKeys.map(async (dayKey) => {
        const entries = await this.timeEntryRepository.findByUserAndDay(userId, dayKey);
        const activeCount = entries.filter(({ status }) => status === 'ACTIVE').length;
        const dailyAdjustments = adjustments.filter((adjustment) => adjustment.dayKey === dayKey);
        const additions = dailyAdjustments.filter(({ type }) => type === 'ADD').length;
        const removals = dailyAdjustments.filter(({ type }) => type === 'REMOVE').length;

        if (activeCount + additions - removals > MAX_DAILY_TIME_ENTRIES) {
          throw new TimeEntryAdjustmentLimitError();
        }
      }),
    );
  }
}
