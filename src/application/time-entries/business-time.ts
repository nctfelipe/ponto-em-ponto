export const BUSINESS_TIME_ZONE = 'America/Sao_Paulo';

interface BusinessDateKeys {
  dayKey: string;
  monthKey: string;
}

const dateKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  day: '2-digit',
  month: '2-digit',
  timeZone: BUSINESS_TIME_ZONE,
  year: 'numeric',
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'full',
  timeZone: BUSINESS_TIME_ZONE,
});

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: BUSINESS_TIME_ZONE,
});

export function getBusinessDateKeys(date: Date): BusinessDateKeys {
  const parts = Object.fromEntries(
    dateKeyFormatter
      .formatToParts(date)
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, value]),
  );
  const year = parts.year ?? '';
  const month = parts.month ?? '';
  const day = parts.day ?? '';

  return {
    dayKey: `${year}-${month}-${day}`,
    monthKey: `${year}-${month}`,
  };
}

export function formatBusinessDate(date: Date) {
  return dateFormatter.format(date);
}

export function formatBusinessTime(date: Date) {
  return timeFormatter.format(date);
}
