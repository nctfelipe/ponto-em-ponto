import type {
  Identity,
  IdentityProvider,
  SignInCredentials,
  SignUpCredentials,
} from '@/application/identity/identity-provider';
import type { ProfileRepository } from '@/application/profiles/profile-repository';
import type { Profile } from '@/domain/profile';

export interface AuthenticatedSession {
  identity: Identity;
  profile: Profile;
}

export type ObservedSession = AuthenticatedSession | { identity: Identity; profile: null } | null;

export interface SessionService {
  ensureProfile(identity: Identity): Promise<AuthenticatedSession>;
  onSessionChanged(callback: (session: ObservedSession) => void, onError: () => void): () => void;
  signIn(credentials: SignInCredentials): Promise<AuthenticatedSession>;
  signInWithGoogle(): Promise<AuthenticatedSession>;
  signOut(): Promise<void>;
  signUp(credentials: SignUpCredentials): Promise<AuthenticatedSession>;
}

export class DefaultSessionService implements SessionService {
  private readonly identityProvider: IdentityProvider;
  private readonly profileRepository: ProfileRepository;

  constructor(identityProvider: IdentityProvider, profileRepository: ProfileRepository) {
    this.identityProvider = identityProvider;
    this.profileRepository = profileRepository;
  }

  async ensureProfile(identity: Identity) {
    const existingProfile = await this.profileRepository.findById(identity.id);
    const profile =
      existingProfile ??
      (await this.profileRepository.createPending({
        id: identity.id,
        displayName: identity.displayName,
        email: identity.email,
      }));

    return { identity, profile };
  }

  onSessionChanged(callback: (session: ObservedSession) => void, onError: () => void) {
    let isActive = true;
    const unsubscribe = this.identityProvider.onIdentityChanged(
      (identity) => {
        if (!isActive) return;

        if (!identity) {
          callback(null);
          return;
        }

        void this.profileRepository
          .findById(identity.id)
          .then((profile) => {
            if (isActive) callback({ identity, profile });
          })
          .catch(() => {
            if (isActive) onError();
          });
      },
      () => {
        if (isActive) onError();
      },
    );

    return () => {
      isActive = false;
      unsubscribe();
    };
  }

  async signUp(credentials: SignUpCredentials) {
    return this.ensureProfile(await this.identityProvider.signUp(credentials));
  }

  async signIn(credentials: SignInCredentials) {
    return this.ensureProfile(await this.identityProvider.signIn(credentials));
  }

  async signInWithGoogle() {
    return this.ensureProfile(await this.identityProvider.signInWithGoogle());
  }

  signOut() {
    return this.identityProvider.signOut();
  }
}
