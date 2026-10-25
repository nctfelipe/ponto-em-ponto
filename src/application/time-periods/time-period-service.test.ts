import { describe, expect, it } from 'vitest';
import type { TimeEntryCorrectionRepository } from '@/application/time-entry-corrections/time-entry-correction-repository';
import type { TimePeriodRepository } from '@/application/time-periods/time-period-repository';
import {
  ClosedTimePeriodError,
  PendingTimeEntryCorrectionsError,
  TimePeriodService,
} from '@/application/time-periods/time-period-service';
import type { TimeEntryCorrection } from '@/domain/time-entry-correction';
import type { TimePeriod } from '@/domain/time-period';

class FakeTimePeriodRepository implements TimePeriodRepository {
  closeInputs: { closedById: string; monthKey: string }[] = [];
  period: TimePeriod = {
    closedAt: null,
    closedById: null,
    monthKey: '2026-09',
    status: 'OPEN',
  };

  close(monthKey: string, closedById: string) {
    this.closeInputs.push({ closedById, monthKey });
    return Promise.resolve();
  }

  find() {
    return Promise.resolve(this.period);
  }
}

class FakeCorrectionRepository implements TimeEntryCorrectionRepository {
  pending: TimeEntryCorrection[] = [];
  apply() {
    return Promise.resolve();
  }
  create() {
    return Promise.resolve();
  }
  decide() {
    return Promise.resolve();
  }
  findById() {
    return Promise.resolve(null);
  }
  findByUserAndMonth() {
    return Promise.resolve([]);
  }
  findPendingByDay() {
    return Promise.resolve(null);
  }
  findPendingByMonth() {
    return Promise.resolve(this.pending);
  }
}

function pendingCorrection(): TimeEntryCorrection {
  return {
    dayKey: '2026-09-10',
    decidedAt: null,
    decidedById: null,
    id: 'correction-1',
    monthKey: '2026-09',
    previousEntries: [],
    proposedEntries: [],
    requestedAt: new Date('2026-09-11T12:00:00.000Z'),
    requestedById: 'user-1',
    status: 'PENDING',
    userId: 'user-1',
  };
}

function createService() {
  const corrections = new FakeCorrectionRepository();
  const periods = new FakeTimePeriodRepository();
  return { corrections, periods, service: new TimePeriodService(periods, corrections) };
}

describe('TimePeriodService', () => {
  it('closes an open period without pending corrections', async () => {
    const { periods, service } = createService();

    await service.close('2026-09', 'admin-1');

    expect(periods.closeInputs).toEqual([{ closedById: 'admin-1', monthKey: '2026-09' }]);
  });

  it('prevents closing a period with pending corrections', async () => {
    const { corrections, periods, service } = createService();
    corrections.pending = [pendingCorrection()];

    await expect(service.close('2026-09', 'admin-1')).rejects.toBeInstanceOf(
      PendingTimeEntryCorrectionsError,
    );
    expect(periods.closeInputs).toHaveLength(0);
  });

  it('prevents closing an already closed period', async () => {
    const { periods, service } = createService();
    periods.period = {
      closedAt: new Date('2026-10-01T12:00:00.000Z'),
      closedById: 'admin-1',
      monthKey: '2026-09',
      status: 'CLOSED',
    };

    await expect(service.close('2026-09', 'admin-1')).rejects.toBeInstanceOf(ClosedTimePeriodError);
    expect(periods.closeInputs).toHaveLength(0);
  });
});
