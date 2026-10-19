import { getBusinessDateKeys } from '@/application/time-entries/business-time';
import type { TimeEntryRepository } from '@/application/time-entries/time-entry-repository';
import { MAX_DAILY_TIME_ENTRIES } from '@/application/time-entries/time-entry-service';
import type {
  NewTimeEntryAdjustment,
  TimeEntryAdjustmentDecision,
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

export interface DecideTimeEntryAdjustmentsInput {
  decidedById: string;
  decisions: TimeEntryAdjustmentDecisionCommand[];
}

export interface TimeEntryAdjustmentDecisionCommand {
  adjustmentId: string;
  decision: 'APPROVE' | 'REJECT';
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

export class TimeEntryAdjustmentNotPendingError extends Error {
  constructor() {
    super('Time entry adjustment is no longer pending.');
    this.name = 'TimeEntryAdjustmentNotPendingError';
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
    const adjustments = await this.prepareAdjustments(input);
    if (adjustments.length > 0) await this.adjustmentRepository.createMany(adjustments);
  }

  async applyAdjustments(input: SubmitTimeEntryAdjustmentsInput) {
    const adjustments = await this.prepareAdjustments(input);
    if (adjustments.length > 0) {
      await this.adjustmentRepository.applyMany(adjustments, input.requestedById);
    }
  }

  findMonth(userId: string, monthKey: string) {
    return this.adjustmentRepository.findByUserAndMonth(userId, monthKey);
  }

  async decideAdjustments(input: DecideTimeEntryAdjustmentsInput) {
    if (input.decisions.length === 0) return;

    const adjustmentIds = input.decisions.map(({ adjustmentId }) => adjustmentId);
    if (new Set(adjustmentIds).size !== adjustmentIds.length) {
      throw new TimeEntryAdjustmentConflictError();
    }

    const adjustments = await Promise.all(
      adjustmentIds.map((id) => this.adjustmentRepository.findById(id)),
    );
    if (adjustments.some((adjustment) => adjustment?.status !== 'PENDING')) {
      throw new TimeEntryAdjustmentNotPendingError();
    }

    const validAdjustments = adjustments.filter(
      (adjustment): adjustment is TimeEntryAdjustment => adjustment !== null,
    );
    const users = [...new Set(validAdjustments.map(({ userId }) => userId))];
    await Promise.all(
      users.map((userId) =>
        this.ensureOpenPeriods(
          userId,
          validAdjustments.filter((adjustment) => adjustment.userId === userId),
        ),
      ),
    );

    const decisions: TimeEntryAdjustmentDecision[] = validAdjustments.map((adjustment, index) => ({
      adjustment,
      status: input.decisions[index]?.decision === 'APPROVE' ? 'APPROVED' : 'REJECTED',
    }));
    const approved = decisions
      .filter(({ status }) => status === 'APPROVED')
      .map(({ adjustment }) => adjustment);

    await this.ensureApprovedTargetsAreAdjustable(approved);
    await this.ensureApprovedDailyLimits(approved);
    await this.adjustmentRepository.decideMany(decisions, input.decidedById);
  }

  private async prepareAdjustments(input: SubmitTimeEntryAdjustmentsInput) {
    if (input.commands.length === 0) return [];

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
    return adjustments;
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

  private async ensureApprovedTargetsAreAdjustable(adjustments: TimeEntryAdjustment[]) {
    const targetAdjustments = adjustments.filter(
      (adjustment) => adjustment.type !== 'ADD' && adjustment.targetTimeEntryId !== null,
    );
    const targetIds = targetAdjustments.flatMap(({ targetTimeEntryId }) =>
      targetTimeEntryId ? [targetTimeEntryId] : [],
    );

    if (new Set(targetIds).size !== targetIds.length) {
      throw new TimeEntryAdjustmentConflictError();
    }

    const entries = await Promise.all(targetIds.map((id) => this.timeEntryRepository.findById(id)));
    entries.forEach((entry, index) => {
      const adjustment = targetAdjustments[index];
      if (!adjustment || entry?.userId !== adjustment.userId || entry.status !== 'ACTIVE') {
        throw new TimeEntryNotAdjustableError();
      }
    });
  }

  private async ensureApprovedDailyLimits(adjustments: TimeEntryAdjustment[]) {
    const days = [
      ...new Map(
        adjustments.map((adjustment) => [
          `${adjustment.userId}:${adjustment.dayKey}`,
          { dayKey: adjustment.dayKey, userId: adjustment.userId },
        ]),
      ).values(),
    ];

    await Promise.all(
      days.map(async ({ dayKey, userId }) => {
        const entries = await this.timeEntryRepository.findByUserAndDay(userId, dayKey);
        const activeCount = entries.filter(({ status }) => status === 'ACTIVE').length;
        const dailyAdjustments = adjustments.filter(
          (adjustment) => adjustment.userId === userId && adjustment.dayKey === dayKey,
        );
        const additions = dailyAdjustments.filter(({ type }) => type === 'ADD').length;
        const removals = dailyAdjustments.filter(({ type }) => type === 'REMOVE').length;

        if (activeCount + additions - removals > MAX_DAILY_TIME_ENTRIES) {
          throw new TimeEntryAdjustmentLimitError();
        }
      }),
    );
  }
}
