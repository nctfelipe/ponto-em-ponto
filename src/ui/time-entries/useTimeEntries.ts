import { useCallback, useEffect, useState } from 'react';
import {
  DailyTimeEntryLimitError,
  type DailyTimeEntries,
  type TimeEntryService,
} from '@/application/time-entries/time-entry-service';
import { formatBusinessDate } from '@/ui/formatters/business-time';

interface CreateUseTimeEntriesDependencies {
  timeEntryService: TimeEntryService;
}

export function createUseTimeEntries({ timeEntryService }: CreateUseTimeEntriesDependencies) {
  return function useTimeEntries(userId: string) {
    const [dailyEntries, setDailyEntries] = useState<DailyTimeEntries>(() => ({
      canRegister: true,
      date: new Date(),
      entries: [],
    }));
    const [isLoading, setIsLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [reloadCount, setReloadCount] = useState(0);

    const findToday = useCallback(() => timeEntryService.findToday(userId, new Date()), [userId]);

    function load() {
      setIsLoading(true);
      setErrorMessage(null);
      setReloadCount((current) => current + 1);
    }

    useEffect(() => {
      let isActive = true;

      void findToday()
        .then((result) => {
          if (isActive) setDailyEntries(result);
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
    }, [findToday, reloadCount]);

    async function record() {
      setIsRegistering(true);
      setErrorMessage(null);

      try {
        setDailyEntries(await timeEntryService.register(userId, new Date()));
      } catch (error: unknown) {
        setErrorMessage(
          error instanceof DailyTimeEntryLimitError
            ? 'Os registros do dia já foram concluídos.'
            : 'Não foi possível registrar o ponto. Tente novamente.',
        );
      } finally {
        setIsRegistering(false);
      }
    }

    return {
      canRecord: dailyEntries.canRegister,
      currentDateLabel: formatBusinessDate(dailyEntries.date),
      entries: dailyEntries.entries,
      errorMessage,
      isLoading,
      isRegistering,
      load,
      record,
    };
  };
}
