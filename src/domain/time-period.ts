export type TimePeriodStatus = 'OPEN' | 'CLOSED';

export interface TimePeriod {
  closedAt: Date | null;
  closedById: string | null;
  monthKey: string;
  status: TimePeriodStatus;
}
