import { BUSINESS_TIME_ZONE } from '@/application/time-entries/business-time';
import { createDateTimeFormatter } from '@/shared/date-time';

export const formatBusinessDate = createDateTimeFormatter('pt-BR', {
  dateStyle: 'full',
  timeZone: BUSINESS_TIME_ZONE,
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
