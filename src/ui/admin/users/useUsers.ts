import { useCallback, useEffect, useState } from 'react';
import type { ProfileService } from '@/application/profiles/profile-service';
import type { Profile } from '@/domain/profile';

interface CreateUseUsersDependencies {
  profileService: ProfileService;
}

export function createUseUsers({ profileService }: CreateUseUsersDependencies) {
  return function useUsers() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activatingId, setActivatingId] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);

    const load = useCallback(async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        setUsers(await profileService.findAll());
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }, []);

    useEffect(() => {
      let isActive = true;

      void profileService
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
        const activeUser = await profileService.activate(user.id);
        setUsers((current) =>
          current.map((item) => (item.id === activeUser.id ? activeUser : item)),
        );
      } catch {
        setHasError(true);
      } finally {
        setActivatingId(null);
      }
    }

    return { activate, activatingId, hasError, isLoading, load, users };
  };
}
