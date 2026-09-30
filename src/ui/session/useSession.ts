import { useEffect, useRef, useState } from 'react';
import type {
  Identity,
  IdentityProvider,
  SignInCredentials,
  SignUpCredentials,
} from '@/application/identity/identity-provider';
import { ensureProfile } from '@/application/profiles/ensure-profile';
import type { ProfileRepository } from '@/application/profiles/profile-repository';
import type { Profile } from '@/domain/profile';

export type SessionState =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'authenticated'; identity: Identity; profile: Profile }
  | { status: 'profile-missing'; identity: Identity }
  | { status: 'error' };

interface CreateUseSessionDependencies {
  identityProvider: IdentityProvider;
  profileRepository: ProfileRepository;
}

export function createUseSession({
  identityProvider,
  profileRepository,
}: CreateUseSessionDependencies) {
  return function useSession() {
    const [state, setState] = useState<SessionState>({ status: 'loading' });
    const authenticationInProgress = useRef(false);

    useEffect(() => {
      let isActive = true;

      const unsubscribe = identityProvider.onIdentityChanged(
        (identity) => {
          if (authenticationInProgress.current) return;

          if (!identity) {
            setState({ status: 'anonymous' });
            return;
          }

          void profileRepository
            .findById(identity.id)
            .then((profile) => {
              if (!isActive) return;

              setState(
                profile
                  ? { status: 'authenticated', identity, profile }
                  : { status: 'profile-missing', identity },
              );
            })
            .catch(() => {
              if (isActive) setState({ status: 'error' });
            });
        },
        () => {
          if (isActive) setState({ status: 'error' });
        },
      );

      return () => {
        isActive = false;
        unsubscribe();
      };
    }, []);

    async function completeAuthentication(identity: Identity) {
      const profile = await ensureProfile(identity, profileRepository);
      setState({ status: 'authenticated', identity, profile });
    }

    async function runAuthentication(action: () => Promise<Identity>) {
      authenticationInProgress.current = true;

      try {
        await completeAuthentication(await action());
      } finally {
        authenticationInProgress.current = false;
      }
    }

    function signUp(credentials: SignUpCredentials) {
      return runAuthentication(() => identityProvider.signUp(credentials));
    }

    function signIn(credentials: SignInCredentials) {
      return runAuthentication(() => identityProvider.signIn(credentials));
    }

    function signInWithGoogle() {
      return runAuthentication(() => identityProvider.signInWithGoogle());
    }

    async function signOut() {
      await identityProvider.signOut();
      setState({ status: 'anonymous' });
    }

    function retryProfile() {
      if (state.status !== 'profile-missing') return Promise.resolve();
      return completeAuthentication(state.identity);
    }

    async function refreshProfile() {
      if (state.status !== 'authenticated') return;

      const profile = await profileRepository.findById(state.identity.id);

      setState(
        profile
          ? { status: 'authenticated', identity: state.identity, profile }
          : { status: 'profile-missing', identity: state.identity },
      );
    }

    return {
      state,
      refreshProfile,
      retryProfile,
      signIn,
      signInWithGoogle,
      signOut,
      signUp,
    };
  };
}
