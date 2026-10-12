import { BUSINESS_TIME_ZONE } from '@/application/time-entries/business-time';
import { createDateTimeFormatter } from '@/shared/date-time';

export const formatBusinessDate = createDateTimeFormatter('pt-BR', {
  dateStyle: 'full',
  timeZone: BUSINESS_TIME_ZONE,
});

export const formatBusinessDay = createDateTimeFormatter('pt-BR', {
  day: '2-digit',
  month: 'long',
  timeZone: BUSINESS_TIME_ZONE,
  weekday: 'long',
});

export const formatBusinessTime = createDateTimeFormatter('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: BUSINESS_TIME_ZONE,
});

export const formatBusinessShortTime = createDateTimeFormatter('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: BUSINESS_TIME_ZONE,
});

const formatCalendarDay = createDateTimeFormatter('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'UTC',
  weekday: 'short',
});

export function formatBusinessDayKey(dayKey: string) {
  return formatCalendarDay(new Date(`${dayKey}T00:00:00.000Z`)).replace(',', '');
}

export function formatWorkedDuration(milliseconds: number) {
  if (milliseconds === 0) return '-';

  const totalMinutes = Math.floor(milliseconds / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours)}h${String(minutes).padStart(2, '0')}`;
}
