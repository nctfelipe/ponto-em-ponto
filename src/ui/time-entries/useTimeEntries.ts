import { useCallback, useEffect, useState } from 'react';
import { formatBusinessDate, getBusinessDateKeys } from '@/application/time-entries/business-time';
import {
  DailyTimeEntryLimitError,
  MAX_DAILY_TIME_ENTRIES,
  registerTimeEntry,
} from '@/application/time-entries/register-time-entry';
import type { TimeEntryRepository } from '@/application/time-entries/time-entry-repository';
import type { TimeEntry } from '@/domain/time-entry';

interface CreateUseTimeEntriesDependencies {
  timeEntryRepository: TimeEntryRepository;
}

export function createUseTimeEntries({ timeEntryRepository }: CreateUseTimeEntriesDependencies) {
  return function useTimeEntries(userId: string) {
    const [entries, setEntries] = useState<TimeEntry[]>([]);
    const [currentDate, setCurrentDate] = useState(() => new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const load = useCallback(async () => {
      const now = new Date();
      const { dayKey } = getBusinessDateKeys(now);
      setCurrentDate(now);
      setIsLoading(true);
      setErrorMessage(null);

      try {
        setEntries(await timeEntryRepository.findByUserAndDay(userId, dayKey));
      } catch {
        setErrorMessage('Não foi possível carregar as batidas de hoje.');
      } finally {
        setIsLoading(false);
      }
    }, [userId]);

    useEffect(() => {
      let isActive = true;
      const now = new Date();
      const { dayKey } = getBusinessDateKeys(now);

      void timeEntryRepository
        .findByUserAndDay(userId, dayKey)
        .then((todayEntries) => {
          if (isActive) setEntries(todayEntries);
        })
        .catch(() => {
          if (isActive) setErrorMessage('Não foi possível carregar as batidas de hoje.');
        })
        .finally(() => {
          if (isActive) setIsLoading(false);
        });

      return () => {
        isActive = false;
      };
    }, [userId]);

    async function record() {
      setIsRegistering(true);
      setErrorMessage(null);

      try {
        const entry = await registerTimeEntry({ now: new Date(), userId }, timeEntryRepository);
        setEntries((current) =>
          [...current, entry].sort(
            (left, right) => left.recordedAt.getTime() - right.recordedAt.getTime(),
          ),
        );
        setCurrentDate(entry.recordedAt);
      } catch (error: unknown) {
        setErrorMessage(
          error instanceof DailyTimeEntryLimitError
            ? 'O limite de oito batidas do dia foi atingido.'
            : 'Não foi possível registrar o ponto. Tente novamente.',
        );
      } finally {
        setIsRegistering(false);
      }
    }

    return {
      canRecord: entries.length < MAX_DAILY_TIME_ENTRIES,
      currentDateLabel: formatBusinessDate(currentDate),
      entries,
      errorMessage,
      isLoading,
      isRegistering,
      load,
      record,
    };
  };
}
