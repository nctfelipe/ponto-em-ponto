import type { TimeEntryCorrectionRepository } from '@/application/time-entry-corrections/time-entry-correction-repository';
import type { TimePeriodRepository } from '@/application/time-periods/time-period-repository';

export class ClosedTimePeriodError extends Error {
  constructor() {
    super('Time period is closed.');
    this.name = 'ClosedTimePeriodError';
  }
}

export class PendingTimeEntryCorrectionsError extends Error {
  constructor() {
    super('Time period has pending corrections.');
    this.name = 'PendingTimeEntryCorrectionsError';
  }
}

export class TimePeriodService {
  private readonly correctionRepository: TimeEntryCorrectionRepository;
  private readonly periodRepository: TimePeriodRepository;

  constructor(
    periodRepository: TimePeriodRepository,
    correctionRepository: TimeEntryCorrectionRepository,
  ) {
    this.periodRepository = periodRepository;
    this.correctionRepository = correctionRepository;
  }

  find(monthKey: string) {
    return this.periodRepository.find(monthKey);
  }

  async close(monthKey: string, closedById: string) {
    const period = await this.periodRepository.find(monthKey);
    if (period.status === 'CLOSED') throw new ClosedTimePeriodError();

    const pendingCorrections = await this.correctionRepository.findPendingByMonth(monthKey);
    if (pendingCorrections.length > 0) throw new PendingTimeEntryCorrectionsError();

    await this.periodRepository.close(monthKey, closedById);
  }
}
