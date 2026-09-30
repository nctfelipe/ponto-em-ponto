import type { ProfileRepository } from '@/application/profiles/profile-repository';

export function approveProfile(profileId: string, profiles: ProfileRepository) {
  return profiles.activate(profileId);
}
