export interface TimePeriodRepository {
  isClosed(userId: string, monthKey: string): Promise<boolean>;
}

export class TimePeriodRepositoryError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'TimePeriodRepositoryError';
  }
}
