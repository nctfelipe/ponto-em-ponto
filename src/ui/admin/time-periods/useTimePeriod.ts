import { useEffect, useState } from 'react';
import { getBusinessDateKeys } from '@/application/time-entries/business-time';
import type { ProfileRepository } from '@/application/profiles/profile-repository';
import {
  ClosedTimePeriodError,
  PendingTimeEntryCorrectionsError,
  type TimePeriodService,
} from '@/application/time-periods/time-period-service';
import type { TimePeriod } from '@/domain/time-period';

interface CreateUseTimePeriodDependencies {
  profileRepository: ProfileRepository;
  timePeriodService: TimePeriodService;
}

export interface PendingTimePeriodUser {
  dayCount: number;
  displayName: string;
  email: string | null;
  userId: string;
}

function getErrorMessage(error: unknown) {
  if (error instanceof PendingTimeEntryCorrectionsError) {
    return 'O mês possui correções pendentes. Revise todas antes de fechá-lo.';
  }
  if (error instanceof ClosedTimePeriodError) return 'Este mês já está fechado.';
  return 'Não foi possível concluir a operação.';
}

export function createUseTimePeriod({
  profileRepository,
  timePeriodService,
}: CreateUseTimePeriodDependencies) {
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

      void Promise.all([
        timePeriodService.find(monthKey),
        timePeriodService.findPendingCorrections(monthKey),
      ])
        .then(async ([result, corrections]) => {
          const profiles = corrections.length > 0 ? await profileRepository.findAll() : [];
          return { corrections, profiles, result };
        })
        .then(({ corrections, profiles, result }) => {
          if (isActive) {
            const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
            const daysByUser = corrections.reduce<Map<string, Set<string>>>(
              (groups, correction) => {
                const days = groups.get(correction.userId) ?? new Set<string>();
                days.add(correction.dayKey);
                groups.set(correction.userId, days);
                return groups;
              },
              new Map(),
            );

            setPeriod(result);
            setPendingUsers(
              [...daysByUser]
                .map(([userId, days]) => {
                  const profile = profilesById.get(userId);
                  return {
                    dayCount: days.size,
                    displayName: profile?.displayName ?? userId,
                    email: profile?.email ?? null,
                    userId,
                  };
                })
                .sort((left, right) => left.displayName.localeCompare(right.displayName, 'pt-BR')),
            );
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
