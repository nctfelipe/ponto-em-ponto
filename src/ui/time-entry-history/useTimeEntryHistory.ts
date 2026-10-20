import { useCallback, useEffect, useState } from 'react';
import { getBusinessDateKeys } from '@/application/time-entries/business-time';
import type {
  MonthlyTimeEntryDay,
  TimeEntryService,
} from '@/application/time-entries/time-entry-service';
import type { TimeEntryCorrectionService } from '@/application/time-entry-corrections/time-entry-correction-service';
import type { TimeEntryCorrection } from '@/domain/time-entry-correction';

interface CreateUseTimeEntryHistoryDependencies {
  correctionService: TimeEntryCorrectionService;
  timeEntryService: TimeEntryService;
}

export function createUseTimeEntryHistory({
  correctionService,
  timeEntryService,
}: CreateUseTimeEntryHistoryDependencies) {
  return function useTimeEntryHistory(userId: string) {
    const [monthKey, setMonthKey] = useState(() => getBusinessDateKeys(new Date()).monthKey);
    const [days, setDays] = useState<MonthlyTimeEntryDay[]>([]);
    const [corrections, setCorrections] = useState<TimeEntryCorrection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [reloadCount, setReloadCount] = useState(0);

    const findMonth = useCallback(
      () =>
        Promise.all([
          timeEntryService.findMonth(userId, monthKey, new Date()),
          correctionService.findMonth(userId, monthKey),
        ]),
      [monthKey, userId],
    );

    useEffect(() => {
      let isActive = true;

      setIsLoading(true);
      setHasError(false);

      void findMonth()
        .then(([timeEntries, monthlyCorrections]) => {
          if (isActive) {
            setDays(timeEntries.days);
            setCorrections(monthlyCorrections);
          }
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
      corrections,
      hasError,
      isLoading,
      load,
      monthKey,
      selectMonth: setMonthKey,
    };
  };
}
