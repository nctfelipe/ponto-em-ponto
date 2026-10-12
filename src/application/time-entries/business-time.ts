import { getZonedDateParts } from '@/shared/date-time';

export const BUSINESS_TIME_ZONE = 'America/Sao_Paulo';

interface BusinessDateKeys {
  dayKey: string;
  monthKey: string;
}

export function getBusinessDateKeys(date: Date): BusinessDateKeys {
  const { day, month, year } = getZonedDateParts(date, BUSINESS_TIME_ZONE);

  return {
    dayKey: `${year}-${month}-${day}`,
    monthKey: `${year}-${month}`,
  };
}
