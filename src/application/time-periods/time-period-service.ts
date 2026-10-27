import type { TimeEntryCorrectionRepository } from '@/application/time-entry-corrections/time-entry-correction-repository';
import type { ProfileRepository } from '@/application/profiles/profile-repository';
import type { TimePeriodRepository } from '@/application/time-periods/time-period-repository';
import type { TimePeriod } from '@/domain/time-period';

export interface PendingTimePeriodUser {
  dayCount: number;
  displayName: string;
  email: string | null;
  userId: string;
}

export interface TimePeriodClosingOverview {
  pendingUsers: PendingTimePeriodUser[];
  period: TimePeriod;
}

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
  private readonly profileRepository: ProfileRepository;

  constructor(
    periodRepository: TimePeriodRepository,
    correctionRepository: TimeEntryCorrectionRepository,
    profileRepository: ProfileRepository,
  ) {
    this.periodRepository = periodRepository;
    this.correctionRepository = correctionRepository;
    this.profileRepository = profileRepository;
  }

  find(monthKey: string) {
    return this.periodRepository.find(monthKey);
  }

  async getClosingOverview(monthKey: string): Promise<TimePeriodClosingOverview> {
    const [period, corrections] = await Promise.all([
      this.periodRepository.find(monthKey),
      this.correctionRepository.findPendingByMonth(monthKey),
    ]);
    const profiles = corrections.length > 0 ? await this.profileRepository.findAll() : [];
    const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
    const daysByUser = corrections.reduce<Map<string, Set<string>>>((groups, correction) => {
      const days = groups.get(correction.userId) ?? new Set<string>();
      days.add(correction.dayKey);
      groups.set(correction.userId, days);
      return groups;
    }, new Map());
    const pendingUsers = [...daysByUser]
      .map(([userId, days]) => {
        const profile = profilesById.get(userId);
        return {
          dayCount: days.size,
          displayName: profile?.displayName ?? userId,
          email: profile?.email ?? null,
          userId,
        };
      })
      .sort((left, right) => left.displayName.localeCompare(right.displayName, 'pt-BR'));

    return { pendingUsers, period };
  }

  async close(monthKey: string, closedById: string) {
    const period = await this.periodRepository.find(monthKey);
    if (period.status === 'CLOSED') throw new ClosedTimePeriodError();

    const pendingCorrections = await this.correctionRepository.findPendingByMonth(monthKey);
    if (pendingCorrections.length > 0) throw new PendingTimeEntryCorrectionsError();

    await this.periodRepository.close(monthKey, closedById);
  }
}
