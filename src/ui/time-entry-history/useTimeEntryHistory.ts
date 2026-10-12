import { useCallback, useEffect, useState } from 'react';
import { getBusinessDateKeys } from '@/application/time-entries/business-time';
import type {
  MonthlyTimeEntryDay,
  TimeEntryService,
} from '@/application/time-entries/time-entry-service';

interface CreateUseTimeEntryHistoryDependencies {
  timeEntryService: TimeEntryService;
}

export function createUseTimeEntryHistory({
  timeEntryService,
}: CreateUseTimeEntryHistoryDependencies) {
  return function useTimeEntryHistory(userId: string) {
    const [monthKey, setMonthKey] = useState(() => getBusinessDateKeys(new Date()).monthKey);
    const [days, setDays] = useState<MonthlyTimeEntryDay[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [reloadCount, setReloadCount] = useState(0);

    const findMonth = useCallback(
      () => timeEntryService.findMonth(userId, monthKey, new Date()),
      [monthKey, userId],
    );

    useEffect(() => {
      let isActive = true;

      setIsLoading(true);
      setHasError(false);

      void findMonth()
        .then((result) => {
          if (isActive) setDays(result.days);
        })
        .catch(() => {
          if (isActive) setHasError(true);
        })
        .finally(() => {
          if (isActive) setIsLoading(false);
        });

      return () => {
        isActive = false;
      };
    }, [findMonth, reloadCount]);

    function load() {
      setReloadCount((current) => current + 1);
    }

    return {
      days,
      hasError,
      isLoading,
      load,
      monthKey,
      selectMonth: setMonthKey,
    };
  };
}
