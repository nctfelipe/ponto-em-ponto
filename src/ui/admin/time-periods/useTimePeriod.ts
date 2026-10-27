import { useEffect, useState } from 'react';
import { getBusinessDateKeys } from '@/application/time-entries/business-time';
import {
  ClosedTimePeriodError,
  PendingTimeEntryCorrectionsError,
  type PendingTimePeriodUser,
  type TimePeriodService,
} from '@/application/time-periods/time-period-service';
import type { TimePeriod } from '@/domain/time-period';

interface CreateUseTimePeriodDependencies {
  timePeriodService: TimePeriodService;
}

function getErrorMessage(error: unknown) {
  if (error instanceof PendingTimeEntryCorrectionsError) {
    return 'O mês possui correções pendentes. Revise todas antes de fechá-lo.';
  }
  if (error instanceof ClosedTimePeriodError) return 'Este mês já está fechado.';
  return 'Não foi possível concluir a operação.';
}

export function createUseTimePeriod({ timePeriodService }: CreateUseTimePeriodDependencies) {
  return function useTimePeriod(closedById: string, initialMonthKey?: string) {
    const [monthKey, setMonthKey] = useState(
      () => initialMonthKey ?? getBusinessDateKeys(new Date()).monthKey,
    );
    const [period, setPeriod] = useState<TimePeriod | null>(null);
    const [pendingUsers, setPendingUsers] = useState<PendingTimePeriodUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isClosing, setIsClosing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [reloadCount, setReloadCount] = useState(0);

    useEffect(() => {
      let isActive = true;

      setIsLoading(true);
      setErrorMessage(null);

      void timePeriodService
        .getClosingOverview(monthKey)
        .then(({ pendingUsers: users, period: result }) => {
          if (isActive) {
            setPeriod(result);
            setPendingUsers(users);
          }
        })
        .catch(() => {
          if (isActive) setErrorMessage('Não foi possível carregar o fechamento do mês.');
        })
        .finally(() => {
          if (isActive) setIsLoading(false);
        });

      return () => {
        isActive = false;
      };
    }, [monthKey, reloadCount]);

    async function close() {
      setIsClosing(true);
      setErrorMessage(null);

      try {
        await timePeriodService.close(monthKey, closedById);
        setPeriod(await timePeriodService.find(monthKey));
        return true;
      } catch (error: unknown) {
        setErrorMessage(getErrorMessage(error));
        return false;
      } finally {
        setIsClosing(false);
      }
    }

    function selectMonth(value: string) {
      setPeriod(null);
      setPendingUsers([]);
      setErrorMessage(null);
      setMonthKey(value);
    }

    function load() {
      setReloadCount((current) => current + 1);
    }

    return {
      close,
      errorMessage,
      isClosing,
      isLoading,
      load,
      monthKey,
      period,
      pendingUsers,
      selectMonth,
    };
  };
}
