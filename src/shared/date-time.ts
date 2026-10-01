export interface ZonedDateParts {
  day: string;
  month: string;
  year: string;
}

export function getZonedDateParts(date: Date, timeZone: string): ZonedDateParts {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      day: '2-digit',
      month: '2-digit',
      timeZone,
      year: 'numeric',
    })
      .formatToParts(date)
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, value]),
  );

  return {
    day: parts.day ?? '',
    month: parts.month ?? '',
    year: parts.year ?? '',
  };
}

export function createDateTimeFormatter(
  locales: Intl.LocalesArgument,
  options: Intl.DateTimeFormatOptions,
) {
  const formatter = new Intl.DateTimeFormat(locales, options);
  return (date: Date) => formatter.format(date);
}
