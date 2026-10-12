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
  adjustments: TimeEntryAdjustment[] = [];
  readonly createInputs: NewTimeEntryAdjustment[] = [];

  create(adjustment: NewTimeEntryAdjustment) {
    this.createInputs.push(adjustment);
    return Promise.resolve(
      createAdjustment({
        ...adjustment,
        id: `adjustment-${String(this.createInputs.length)}`,
        requestedAt: new Date('2026-09-12T12:00:00.000Z'),
        status: 'PENDING',
      }),
    );
  }

  findByTimeEntryId(timeEntryId: string) {
    return Promise.resolve(
      this.adjustments.filter((adjustment) => adjustment.targetTimeEntryId === timeEntryId),
    );
  }

  findByUserAndDay(userId: string, dayKey: string) {
    return Promise.resolve(
      this.adjustments.filter(
        (adjustment) => adjustment.userId === userId && adjustment.dayKey === dayKey,
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
  it('creates a change request from the current effective time', async () => {
    const { adjustmentRepository, service } = createService();
    const effectiveTime = new Date('2026-09-10T10:55:00.000Z');
    const proposedTime = new Date('2026-09-10T11:05:00.000Z');
    adjustmentRepository.adjustments = [
      createAdjustment({
        decidedAt: new Date('2026-09-11T14:00:00.000Z'),
        decidedById: 'admin-1',
        proposedRecordedAt: effectiveTime,
        status: 'APPROVED',
        type: 'CHANGE',
      }),
    ];

    await service.requestChange({
      proposedRecordedAt: proposedTime,
      requestedById: 'user-1',
      timeEntryId: originalEntry.id,
      userId: 'user-1',
    });

    expect(adjustmentRepository.createInputs).toEqual([
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
    ]);
  });

  it('prevents a second pending request for the same time entry', async () => {
    const { adjustmentRepository, service } = createService();
    adjustmentRepository.adjustments = [createAdjustment()];

    await expect(
      service.requestRemoval({
        requestedById: 'user-1',
        timeEntryId: originalEntry.id,
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(TimeEntryAdjustmentConflictError);
  });

  it('prevents changes to an effectively removed time entry', async () => {
    const { adjustmentRepository, service } = createService();
    adjustmentRepository.adjustments = [
      createAdjustment({
        decidedAt: new Date('2026-09-11T14:00:00.000Z'),
        decidedById: 'admin-1',
        status: 'APPROVED',
      }),
    ];

    await expect(
      service.requestChange({
        proposedRecordedAt: new Date('2026-09-10T11:05:00.000Z'),
        requestedById: 'user-1',
        timeEntryId: originalEntry.id,
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(TimeEntryNotAdjustableError);
  });

  it('prevents requests in a closed month', async () => {
    const { periodRepository, service } = createService();
    periodRepository.isPeriodClosed = true;

    await expect(
      service.requestAddition({
        proposedRecordedAt: new Date('2026-09-10T15:00:00.000Z'),
        requestedById: 'user-1',
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(ClosedTimePeriodError);
  });

  it('prevents an addition above the effective daily limit', async () => {
    const { service, timeEntryRepository } = createService();
    timeEntryRepository.entries = Array.from({ length: 8 }, (_, index) => ({
      ...originalEntry,
      id: `entry-${String(index)}`,
    }));

    await expect(
      service.requestAddition({
        proposedRecordedAt: new Date('2026-09-10T15:00:00.000Z'),
        requestedById: 'user-1',
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(TimeEntryAdjustmentLimitError);
  });
});
