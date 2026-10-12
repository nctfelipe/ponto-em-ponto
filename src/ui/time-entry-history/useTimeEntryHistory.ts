import { useCallback, useEffect, useState } from 'react';
import { getBusinessDateKeys } from '@/application/time-entries/business-time';
import type { TimeEntryService } from '@/application/time-entries/time-entry-service';
import type { TimeEntry } from '@/domain/time-entry';

interface CreateUseTimeEntryHistoryDependencies {
  timeEntryService: TimeEntryService;
}

export function createUseTimeEntryHistory({
  timeEntryService,
}: CreateUseTimeEntryHistoryDependencies) {
  return function useTimeEntryHistory(userId: string) {
    const [monthKey, setMonthKey] = useState(() => getBusinessDateKeys(new Date()).monthKey);
    const [entries, setEntries] = useState<TimeEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [reloadCount, setReloadCount] = useState(0);

    const findMonth = useCallback(
      () => timeEntryService.findMonth(userId, monthKey),
      [monthKey, userId],
    );

    useEffect(() => {
      let isActive = true;

      setIsLoading(true);
      setHasError(false);

      void findMonth()
        .then((result) => {
          if (isActive) setEntries(result);
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
      entries,
      hasError,
      isLoading,
      load,
      monthKey,
      selectMonth: setMonthKey,
    };
  };
}
