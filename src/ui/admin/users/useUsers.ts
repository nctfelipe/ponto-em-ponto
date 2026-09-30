import { useCallback, useEffect, useState } from 'react';
import { approveProfile } from '@/application/profiles/approve-profile';
import type { ProfileRepository } from '@/application/profiles/profile-repository';
import type { Profile } from '@/domain/profile';

interface CreateUseUsersDependencies {
  profileRepository: ProfileRepository;
}

interface UseUsersOptions {
  currentUserId: string;
  onCurrentUserActivated: () => Promise<void>;
}

export function createUseUsers({ profileRepository }: CreateUseUsersDependencies) {
  return function useUsers({ currentUserId, onCurrentUserActivated }: UseUsersOptions) {
    const [users, setUsers] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activatingId, setActivatingId] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);

    const load = useCallback(async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        setUsers(await profileRepository.findAll());
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }, []);

    useEffect(() => {
      let isActive = true;

      void profileRepository
        .findAll()
        .then((profiles) => {
          if (isActive) setUsers(profiles);
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
    }, []);

    async function activate(user: Profile) {
      setActivatingId(user.id);
      setHasError(false);

      try {
        const activeUser = await approveProfile(user.id, profileRepository);
        setUsers((current) =>
          current.map((item) => (item.id === activeUser.id ? activeUser : item)),
        );

        if (user.id === currentUserId) {
          await onCurrentUserActivated();
        }
      } catch {
        setHasError(true);
      } finally {
        setActivatingId(null);
      }
    }

    return { activate, activatingId, hasError, isLoading, load, users };
  };
}
