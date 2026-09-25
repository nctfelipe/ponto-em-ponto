import type { Identity } from '@/application/identity/identity-provider';
import type { ProfileRepository } from '@/application/profiles/profile-repository';

export async function ensureProfile(identity: Identity, profiles: ProfileRepository) {
  const existingProfile = await profiles.findById(identity.id);

  if (existingProfile) {
    return existingProfile;
  }

  return profiles.createPending({
    id: identity.id,
    displayName: identity.displayName,
    email: identity.email,
  });
}
