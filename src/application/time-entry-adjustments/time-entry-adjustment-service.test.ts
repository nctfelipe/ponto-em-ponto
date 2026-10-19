import { describe, expect, it } from 'vitest';
import type { TimeEntryRepository } from '@/application/time-entries/time-entry-repository';
import {
  ClosedTimePeriodError,
  TimeEntryAdjustmentConflictError,
  TimeEntryAdjustmentLimitError,
  TimeEntryAdjustmentService,
  TimeEntryNotAdjustableError,
} from '@/application/time-entry-adjustments/time-entry-adjustment-service';
import type {
  NewTimeEntryAdjustment,
  TimeEntryAdjustmentDecision,
  TimeEntryAdjustmentRepository,
} from '@/application/time-entry-adjustments/time-entry-adjustment-repository';
import type { TimePeriodRepository } from '@/application/time-periods/time-period-repository';
import type { TimeEntry } from '@/domain/time-entry';
import type { TimeEntryAdjustment } from '@/domain/time-entry-adjustment';

const originalEntry: TimeEntry = {
  dayKey: '2026-09-10',
  id: 'entry-1',
  monthKey: '2026-09',
  recordedAt: new Date('2026-09-10T11:00:00.000Z'),
  status: 'ACTIVE',
  userId: 'user-1',
};

function createAdjustment(overrides: Partial<TimeEntryAdjustment> = {}): TimeEntryAdjustment {
  return {
    currentRecordedAt: originalEntry.recordedAt,
    dayKey: originalEntry.dayKey,
    decidedAt: null,
    decidedById: null,
    id: 'adjustment-1',
    monthKey: originalEntry.monthKey,
    proposedRecordedAt: null,
    requestedAt: new Date('2026-09-11T12:00:00.000Z'),
    requestedById: originalEntry.userId,
    status: 'PENDING',
    targetTimeEntryId: originalEntry.id,
    type: 'REMOVE',
    userId: originalEntry.userId,
    ...overrides,
  };
}

class FakeTimeEntryRepository implements TimeEntryRepository {
  entries: TimeEntry[] = [originalEntry];

  create() {
    return Promise.resolve(originalEntry);
  }

  findById(id: string) {
    return Promise.resolve(this.entries.find((entry) => entry.id === id) ?? null);
  }

  findByUserAndDay(userId: string, dayKey: string) {
    return Promise.resolve(
      this.entries.filter((entry) => entry.userId === userId && entry.dayKey === dayKey),
    );
  }

  findByUserAndMonth(userId: string, monthKey: string) {
    return Promise.resolve(
      this.entries.filter((entry) => entry.userId === userId && entry.monthKey === monthKey),
    );
  }
}

class FakeAdjustmentRepository implements TimeEntryAdjustmentRepository {
  readonly applyInputs: { adjustments: NewTimeEntryAdjustment[]; decidedById: string }[] = [];
  adjustments: TimeEntryAdjustment[] = [];
  readonly createInputs: NewTimeEntryAdjustment[][] = [];
  readonly decisionInputs: {
    decisions: TimeEntryAdjustmentDecision[];
    decidedById: string;
  }[] = [];

  createMany(adjustments: NewTimeEntryAdjustment[]) {
    this.createInputs.push(adjustments);
    return Promise.resolve();
  }

  applyMany(adjustments: NewTimeEntryAdjustment[], decidedById: string) {
    this.applyInputs.push({ adjustments, decidedById });
    return Promise.resolve();
  }

  decideMany(decisions: TimeEntryAdjustmentDecision[], decidedById: string) {
    this.decisionInputs.push({ decisions, decidedById });
    return Promise.resolve();
  }

  findById(id: string) {
    return Promise.resolve(this.adjustments.find((adjustment) => adjustment.id === id) ?? null);
  }

  findByTimeEntryId(timeEntryId: string) {
    return Promise.resolve(
      this.adjustments.filter((adjustment) => adjustment.targetTimeEntryId === timeEntryId),
    );
  }

  findByUserAndMonth(userId: string, monthKey: string) {
    return Promise.resolve(
      this.adjustments.filter(
        (adjustment) => adjustment.userId === userId && adjustment.monthKey === monthKey,
      ),
    );
  }
}

class FakeTimePeriodRepository implements TimePeriodRepository {
  isPeriodClosed = false;

  isClosed() {
    return Promise.resolve(this.isPeriodClosed);
  }
}

function createService() {
  const adjustmentRepository = new FakeAdjustmentRepository();
  const periodRepository = new FakeTimePeriodRepository();
  const timeEntryRepository = new FakeTimeEntryRepository();

  return {
    adjustmentRepository,
    periodRepository,
    service: new TimeEntryAdjustmentService(
      adjustmentRepository,
      periodRepository,
      timeEntryRepository,
    ),
    timeEntryRepository,
  };
}

describe('TimeEntryAdjustmentService', () => {
  it('persists a validated batch from the current effective state', async () => {
    const { adjustmentRepository, service, timeEntryRepository } = createService();
    const effectiveTime = new Date('2026-09-10T10:55:00.000Z');
    const proposedTime = new Date('2026-09-10T11:05:00.000Z');
    timeEntryRepository.entries = [{ ...originalEntry, recordedAt: effectiveTime }];

    await service.submitAdjustments({
      commands: [
        { proposedRecordedAt: proposedTime, timeEntryId: originalEntry.id, type: 'CHANGE' },
        { proposedRecordedAt: new Date('2026-09-10T15:00:00.000Z'), type: 'ADD' },
      ],
      requestedById: 'user-1',
      userId: 'user-1',
    });

    expect(adjustmentRepository.createInputs).toEqual([
      [
        {
          currentRecordedAt: effectiveTime,
          dayKey: originalEntry.dayKey,
          monthKey: originalEntry.monthKey,
          proposedRecordedAt: proposedTime,
          requestedById: 'user-1',
          targetTimeEntryId: originalEntry.id,
          type: 'CHANGE',
          userId: 'user-1',
        },
        {
          currentRecordedAt: null,
          dayKey: originalEntry.dayKey,
          monthKey: originalEntry.monthKey,
          proposedRecordedAt: new Date('2026-09-10T15:00:00.000Z'),
          requestedById: 'user-1',
          targetTimeEntryId: null,
          type: 'ADD',
          userId: 'user-1',
        },
      ],
    ]);
  });

  it('applies an administrative batch with its decision author', async () => {
    const { adjustmentRepository, service } = createService();

    await service.applyAdjustments({
      commands: [{ timeEntryId: originalEntry.id, type: 'REMOVE' }],
      requestedById: 'admin-1',
      userId: 'user-1',
    });

    expect(adjustmentRepository.applyInputs).toEqual([
      {
        adjustments: [
          {
            currentRecordedAt: originalEntry.recordedAt,
            dayKey: originalEntry.dayKey,
            monthKey: originalEntry.monthKey,
            proposedRecordedAt: null,
            requestedById: 'admin-1',
            targetTimeEntryId: originalEntry.id,
            type: 'REMOVE',
            userId: 'user-1',
          },
        ],
        decidedById: 'admin-1',
      },
    ]);
  });

  it('applies reviewed decisions as a single batch', async () => {
    const { adjustmentRepository, service } = createService();
    const approvedAdjustment = createAdjustment();
    const rejectedAdjustment = createAdjustment({ id: 'adjustment-2', type: 'ADD' });
    adjustmentRepository.adjustments = [approvedAdjustment, rejectedAdjustment];

    await service.decideAdjustments({
      decidedById: 'admin-1',
      decisions: [
        { adjustmentId: approvedAdjustment.id, decision: 'APPROVE' },
        { adjustmentId: rejectedAdjustment.id, decision: 'REJECT' },
      ],
    });

    expect(adjustmentRepository.decisionInputs).toEqual([
      {
        decidedById: 'admin-1',
        decisions: [
          { adjustment: approvedAdjustment, status: 'APPROVED' },
          { adjustment: rejectedAdjustment, status: 'REJECTED' },
        ],
      },
    ]);
  });

  it('rejects the whole review when approved additions exceed the daily limit', async () => {
    const { adjustmentRepository, service, timeEntryRepository } = createService();
    timeEntryRepository.entries = Array.from({ length: 7 }, (_, index) => ({
      ...originalEntry,
      id: `entry-${String(index)}`,
    }));
    adjustmentRepository.adjustments = [
      createAdjustment({
        currentRecordedAt: null,
        id: 'adjustment-add-1',
        proposedRecordedAt: new Date('2026-09-10T15:00:00.000Z'),
        targetTimeEntryId: null,
        type: 'ADD',
      }),
      createAdjustment({
        currentRecordedAt: null,
        id: 'adjustment-add-2',
        proposedRecordedAt: new Date('2026-09-10T18:00:00.000Z'),
        targetTimeEntryId: null,
        type: 'ADD',
      }),
    ];

    await expect(
      service.decideAdjustments({
        decidedById: 'admin-1',
        decisions: adjustmentRepository.adjustments.map(({ id }) => ({
          adjustmentId: id,
          decision: 'APPROVE',
        })),
      }),
    ).rejects.toBeInstanceOf(TimeEntryAdjustmentLimitError);
    expect(adjustmentRepository.decisionInputs).toHaveLength(0);
  });

  it('prevents a second pending request for the same time entry', async () => {
    const { adjustmentRepository, service } = createService();
    adjustmentRepository.adjustments = [createAdjustment()];

    await expect(
      service.submitAdjustments({
        commands: [{ timeEntryId: originalEntry.id, type: 'REMOVE' }],
        requestedById: 'user-1',
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(TimeEntryAdjustmentConflictError);
  });

  it('prevents changes to a removed time entry', async () => {
    const { service, timeEntryRepository } = createService();
    timeEntryRepository.entries = [{ ...originalEntry, status: 'REMOVED' }];

    await expect(
      service.submitAdjustments({
        commands: [
          {
            proposedRecordedAt: new Date('2026-09-10T11:05:00.000Z'),
            timeEntryId: originalEntry.id,
            type: 'CHANGE',
          },
        ],
        requestedById: 'user-1',
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(TimeEntryNotAdjustableError);
  });

  it('prevents requests in a closed month', async () => {
    const { periodRepository, service } = createService();
    periodRepository.isPeriodClosed = true;

    await expect(
      service.submitAdjustments({
        commands: [{ proposedRecordedAt: new Date('2026-09-10T15:00:00.000Z'), type: 'ADD' }],
        requestedById: 'user-1',
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(ClosedTimePeriodError);
  });

  it('rejects the whole batch when its additions exceed the effective daily limit', async () => {
    const { adjustmentRepository, service, timeEntryRepository } = createService();
    timeEntryRepository.entries = Array.from({ length: 7 }, (_, index) => ({
      ...originalEntry,
      id: `entry-${String(index)}`,
    }));

    await expect(
      service.submitAdjustments({
        commands: [
          { proposedRecordedAt: new Date('2026-09-10T15:00:00.000Z'), type: 'ADD' },
          { proposedRecordedAt: new Date('2026-09-10T18:00:00.000Z'), type: 'ADD' },
        ],
        requestedById: 'user-1',
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(TimeEntryAdjustmentLimitError);
    expect(adjustmentRepository.createInputs).toHaveLength(0);
  });
});
