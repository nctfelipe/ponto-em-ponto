import { describe, expect, it, vi } from 'vitest';
import type {
  Identity,
  IdentityProvider,
  SignInCredentials,
  SignUpCredentials,
} from '@/application/identity/identity-provider';
import type {
  NewPendingProfile,
  ProfileRepository,
} from '@/application/profiles/profile-repository';
import { DefaultSessionService } from '@/application/session/session-service';
import type { Profile } from '@/domain/profile';

const identity: Identity = {
  id: 'user-1',
  displayName: 'User One',
  email: 'user@example.com',
  isAdmin: false,
};

const activeProfile: Profile = {
  id: identity.id,
  displayName: identity.displayName,
  email: identity.email,
  status: 'ACTIVE',
};

class FakeIdentityProvider implements IdentityProvider {
  readonly signInInputs: SignInCredentials[] = [];
  readonly signUpInputs: SignUpCredentials[] = [];
  private identityCallback: ((value: Identity | null) => void) | null = null;

  signUp(credentials: SignUpCredentials) {
    this.signUpInputs.push(credentials);
    return Promise.resolve(identity);
  }

  signIn(credentials: SignInCredentials) {
    this.signInInputs.push(credentials);
    return Promise.resolve(identity);
  }

  signInWithGoogle() {
    return Promise.resolve(identity);
  }

  signOut() {
    return Promise.resolve();
  }

  onIdentityChanged(callback: (value: Identity | null) => void) {
    this.identityCallback = callback;
    return () => {
      this.identityCallback = null;
    };
  }

  emitIdentity(value: Identity | null) {
    this.identityCallback?.(value);
  }
}

class FakeProfileRepository implements ProfileRepository {
  readonly createInputs: NewPendingProfile[] = [];
  private readonly profile: Profile | null;

  constructor(profile: Profile | null) {
    this.profile = profile;
  }

  findById() {
    return Promise.resolve(this.profile);
  }

  findAll() {
    return Promise.resolve(this.profile ? [this.profile] : []);
  }

  createPending(profile: NewPendingProfile) {
    this.createInputs.push(profile);
    return Promise.resolve({ ...profile, status: 'PENDING' as const });
  }

  activate() {
    return Promise.resolve(activeProfile);
  }
}

describe('DefaultSessionService', () => {
  it('creates a pending profile after sign-up when the profile is missing', async () => {
    const identityProvider = new FakeIdentityProvider();
    const profileRepository = new FakeProfileRepository(null);
    const service = new DefaultSessionService(identityProvider, profileRepository);
    const credentials = {
      displayName: identity.displayName,
      email: identity.email,
      password: 'password',
    };

    const session = await service.signUp(credentials);

    expect(identityProvider.signUpInputs).toEqual([credentials]);
    expect(profileRepository.createInputs).toEqual([
      { id: identity.id, displayName: identity.displayName, email: identity.email },
    ]);
    expect(session).toMatchObject({ identity, profile: { status: 'PENDING' } });
  });

  it('reuses an existing profile after sign-in', async () => {
    const identityProvider = new FakeIdentityProvider();
    const profileRepository = new FakeProfileRepository(activeProfile);
    const service = new DefaultSessionService(identityProvider, profileRepository);

    const session = await service.signIn({ email: identity.email, password: 'password' });

    expect(session).toEqual({ identity, profile: activeProfile });
    expect(profileRepository.createInputs).toHaveLength(0);
  });

  it('reports an observed identity with a missing profile without creating it', async () => {
    const identityProvider = new FakeIdentityProvider();
    const profileRepository = new FakeProfileRepository(null);
    const service = new DefaultSessionService(identityProvider, profileRepository);
    const callback = vi.fn();

    service.onSessionChanged(callback, vi.fn());
    identityProvider.emitIdentity(identity);

    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalledWith({ identity, profile: null });
    });
    expect(profileRepository.createInputs).toHaveLength(0);
  });
});
