import { useCallback, useEffect, useState } from 'react';
import type { ProfileRepository } from '@/application/profiles/profile-repository';
import type { Profile } from '@/domain/profile';

interface CreateUseUserProfileDependencies {
  profileRepository: ProfileRepository;
}

export function createUseUserProfile({ profileRepository }: CreateUseUserProfileDependencies) {
  return function useUserProfile(userId: string) {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [reloadCount, setReloadCount] = useState(0);

    const findProfile = useCallback(() => profileRepository.findById(userId), [userId]);

    useEffect(() => {
      let isActive = true;

      setIsLoading(true);
      setHasError(false);

      void findProfile()
        .then((result) => {
          if (isActive) setProfile(result);
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
    }, [findProfile, reloadCount]);

    function load() {
      setReloadCount((current) => current + 1);
    }

    return { hasError, isLoading, load, profile };
  };
}
