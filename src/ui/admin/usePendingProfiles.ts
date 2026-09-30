import { useCallback, useEffect, useState } from 'react';
import { approveProfile } from '@/application/profiles/approve-profile';
import type { ProfileRepository } from '@/application/profiles/profile-repository';
import type { Profile } from '@/domain/profile';

interface UsePendingProfilesDependencies {
  currentProfileId: string;
  onCurrentProfileApproved: () => Promise<void>;
  profileRepository: ProfileRepository;
}

export function usePendingProfiles({
  currentProfileId,
  onCurrentProfileApproved,
  profileRepository,
}: UsePendingProfilesDependencies) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      setProfiles(await profileRepository.findPending());
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [profileRepository]);

  useEffect(() => {
    let isActive = true;

    void profileRepository
      .findPending()
      .then((pendingProfiles) => {
        if (isActive) setProfiles(pendingProfiles);
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
  }, [profileRepository]);

  async function approve(profile: Profile) {
    setApprovingId(profile.id);
    setHasError(false);

    try {
      await approveProfile(profile.id, profileRepository);
      setProfiles((current) => current.filter(({ id }) => id !== profile.id));

      if (profile.id === currentProfileId) {
        await onCurrentProfileApproved();
      }
    } catch {
      setHasError(true);
    } finally {
      setApprovingId(null);
    }
  }

  return { approve, approvingId, hasError, isLoading, load, profiles };
}
