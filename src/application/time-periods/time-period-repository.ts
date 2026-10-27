import type { TimePeriod } from '@/domain/time-period';

export interface TimePeriodRepository {
  close(monthKey: string, closedById: string): Promise<void>;
  find(monthKey: string): Promise<TimePeriod>;
}

export class TimePeriodRepositoryError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'TimePeriodRepositoryError';
  }
}
