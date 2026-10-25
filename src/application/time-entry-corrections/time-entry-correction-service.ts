import { getBusinessDateKeys } from '@/application/time-entries/business-time';
import type { TimeEntryRepository } from '@/application/time-entries/time-entry-repository';
import { MAX_DAILY_TIME_ENTRIES } from '@/application/time-entries/time-entry-service';
import type {
  NewTimeEntryCorrection,
  TimeEntryCorrectionRepository,
} from '@/application/time-entry-corrections/time-entry-correction-repository';
import type { TimePeriodRepository } from '@/application/time-periods/time-period-repository';
import type { CorrectionEntry, TimeEntryCorrectionStatus } from '@/domain/time-entry-correction';

export interface SubmitTimeEntryCorrectionInput {
  dayKey: string;
  proposedEntries: CorrectionEntry[];
  requestedById: string;
  userId: string;
}

export class ClosedTimePeriodError extends Error {}
export class PendingTimeEntryCorrectionError extends Error {}
export class InvalidTimeEntryCorrectionError extends Error {}
export class TimeEntryCorrectionNotPendingError extends Error {}
export class OutdatedTimeEntryCorrectionError extends Error {}

function toCorrectionEntries(
  entries: Awaited<ReturnType<TimeEntryRepository['findByUserAndDay']>>,
): CorrectionEntry[] {
  return entries
    .filter(({ status }) => status === 'ACTIVE')
    .sort((left, right) => left.recordedAt.getTime() - right.recordedAt.getTime())
    .map(({ id, recordedAt }) => ({ recordedAt, timeEntryId: id }));
}

function matchesSnapshot(current: CorrectionEntry[], snapshot: CorrectionEntry[]) {
  const fingerprint = (entries: CorrectionEntry[]) =>
    entries.map(
      ({ recordedAt, timeEntryId }) => `${timeEntryId ?? 'new'}:${String(recordedAt.getTime())}`,
    );
  return fingerprint(current).join('|') === fingerprint(snapshot).join('|');
}

export class TimeEntryCorrectionService {
  private readonly correctionRepository: TimeEntryCorrectionRepository;
  private readonly periodRepository: TimePeriodRepository;
  private readonly timeEntryRepository: TimeEntryRepository;

  constructor(
    correctionRepository: TimeEntryCorrectionRepository,
    periodRepository: TimePeriodRepository,
    timeEntryRepository: TimeEntryRepository,
  ) {
    this.correctionRepository = correctionRepository;
    this.periodRepository = periodRepository;
    this.timeEntryRepository = timeEntryRepository;
  }

  findMonth(userId: string, monthKey: string) {
    return this.correctionRepository.findByUserAndMonth(userId, monthKey);
  }

  async request(input: SubmitTimeEntryCorrectionInput) {
    const correction = await this.prepare(input);
    await this.correctionRepository.create(correction);
  }

  async apply(input: SubmitTimeEntryCorrectionInput) {
    const correction = await this.prepare(input);
    await this.correctionRepository.apply(correction, input.requestedById);
  }

  async decide(
    correctionId: string,
    status: Exclude<TimeEntryCorrectionStatus, 'PENDING'>,
    decidedById: string,
  ) {
    const correction = await this.correctionRepository.findById(correctionId);
    if (correction?.status !== 'PENDING') {
      throw new TimeEntryCorrectionNotPendingError();
    }

    await this.ensureOpenPeriod(correction.userId, correction.monthKey);

    if (status === 'APPROVED') {
      this.validateProposal(correction.dayKey, correction.proposedEntries);
      const current = toCorrectionEntries(
        await this.timeEntryRepository.findByUserAndDay(correction.userId, correction.dayKey),
      );
      if (!matchesSnapshot(current, correction.previousEntries)) {
        throw new OutdatedTimeEntryCorrectionError();
      }
      this.ensureKnownEntryIds(current, correction.proposedEntries);
    }

    await this.correctionRepository.decide(correction, status, decidedById);
  }

  private async prepare(input: SubmitTimeEntryCorrectionInput) {
    if (!/^\d{4}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/.test(input.dayKey)) {
      throw new InvalidTimeEntryCorrectionError();
    }
    const monthKey = input.dayKey.slice(0, 7);
    this.validateProposal(input.dayKey, input.proposedEntries);
    await this.ensureOpenPeriod(input.userId, monthKey);

    const pending = await this.correctionRepository.findPendingByDay(input.userId, input.dayKey);
    if (pending) throw new PendingTimeEntryCorrectionError();

    const current = toCorrectionEntries(
      await this.timeEntryRepository.findByUserAndDay(input.userId, input.dayKey),
    );
    this.ensureKnownEntryIds(current, input.proposedEntries);

    return {
      dayKey: input.dayKey,
      monthKey,
      previousEntries: current,
      proposedEntries: [...input.proposedEntries].sort(
        (left, right) => left.recordedAt.getTime() - right.recordedAt.getTime(),
      ),
      requestedById: input.requestedById,
      userId: input.userId,
    } satisfies NewTimeEntryCorrection;
  }

  private validateProposal(dayKey: string, entries: CorrectionEntry[]) {
    if (entries.length > MAX_DAILY_TIME_ENTRIES || entries.length % 2 !== 0) {
      throw new InvalidTimeEntryCorrectionError();
    }

    const ids = entries.flatMap(({ timeEntryId }) => (timeEntryId ? [timeEntryId] : []));
    if (new Set(ids).size !== ids.length) throw new InvalidTimeEntryCorrectionError();

    if (entries.some(({ recordedAt }) => getBusinessDateKeys(recordedAt).dayKey !== dayKey)) {
      throw new InvalidTimeEntryCorrectionError();
    }
  }

  private ensureKnownEntryIds(current: CorrectionEntry[], proposed: CorrectionEntry[]) {
    const currentIds = new Set(current.map(({ timeEntryId }) => timeEntryId));
    if (proposed.some(({ timeEntryId }) => timeEntryId && !currentIds.has(timeEntryId))) {
      throw new InvalidTimeEntryCorrectionError();
    }
  }

  private async ensureOpenPeriod(userId: string, monthKey: string) {
    if (await this.periodRepository.isClosed(userId, monthKey)) {
      throw new ClosedTimePeriodError();
    }
  }
}
