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

const businessDateTimeInputFormatter = new Intl.DateTimeFormat('en-CA', {
  day: '2-digit',
  hour: '2-digit',
  hourCycle: 'h23',
  minute: '2-digit',
  month: '2-digit',
  timeZone: BUSINESS_TIME_ZONE,
  year: 'numeric',
});

export function formatBusinessDateTimeInput(date: Date) {
  const parts = businessDateTimeInputFormatter.formatToParts(date);
  const getPart = (type: Intl.DateTimeFormatPartTypes) => {
    const value = parts.find((part) => part.type === type)?.value;
    if (!value) throw new RangeError('Unable to format date and time.');
    return value;
  };

  return `${getPart('year')}-${getPart('month')}-${getPart('day')}T${getPart('hour')}:${getPart('minute')}`;
}

export function parseBusinessDateTimeInput(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new RangeError('Invalid date and time.');

  const [, year, month, day, hour, minute] = match;
  const target = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  );
  let result = new Date(target);

  for (let iteration = 0; iteration < 2; iteration += 1) {
    const currentValue = formatBusinessDateTimeInput(result);
    const currentMatch = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(currentValue);
    if (!currentMatch) break;

    const [, currentYear, currentMonth, currentDay, currentHour, currentMinute] = currentMatch;
    const current = Date.UTC(
      Number(currentYear),
      Number(currentMonth) - 1,
      Number(currentDay),
      Number(currentHour),
      Number(currentMinute),
    );
    result = new Date(result.getTime() + target - current);
  }

  return result;
}
