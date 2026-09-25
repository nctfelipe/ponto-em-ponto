import type { Identity } from '../identity/identity-provider';
import type { ProfileRepository } from './profile-repository';

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
