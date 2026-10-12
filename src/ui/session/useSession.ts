import { useEffect, useRef, useState } from 'react';
import type {
  Identity,
  SignInCredentials,
  SignUpCredentials,
} from '@/application/identity/identity-provider';
import type { AuthenticatedSession, SessionService } from '@/application/session/session-service';
import type { Profile } from '@/domain/profile';

export type SessionState =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'authenticated'; identity: Identity; profile: Profile }
  | { status: 'profile-missing'; identity: Identity }
  | { status: 'error' };

interface CreateUseSessionDependencies {
  sessionService: SessionService;
}

export function createUseSession({ sessionService }: CreateUseSessionDependencies) {
  return function useSession() {
    const [state, setState] = useState<SessionState>({ status: 'loading' });
    const authenticationInProgress = useRef(false);

    useEffect(() => {
      let isActive = true;

      const unsubscribe = sessionService.onSessionChanged(
        (session) => {
          if (authenticationInProgress.current) return;

          if (!session) {
            setState({ status: 'anonymous' });
            return;
          }

          if (!isActive) return;
          setState(
            session.profile
              ? { status: 'authenticated', ...session }
              : { status: 'profile-missing', identity: session.identity },
          );
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

    async function runAuthentication(action: () => Promise<AuthenticatedSession>) {
      authenticationInProgress.current = true;

      try {
        setState({ status: 'authenticated', ...(await action()) });
      } finally {
        authenticationInProgress.current = false;
      }
    }

    function signUp(credentials: SignUpCredentials) {
      return runAuthentication(() => sessionService.signUp(credentials));
    }

    function signIn(credentials: SignInCredentials) {
      return runAuthentication(() => sessionService.signIn(credentials));
    }

    function signInWithGoogle() {
      return runAuthentication(() => sessionService.signInWithGoogle());
    }

    async function signOut() {
      await sessionService.signOut();
      setState({ status: 'anonymous' });
    }

    function retryProfile() {
      if (state.status !== 'profile-missing') return Promise.resolve();
      return runAuthentication(() => sessionService.ensureProfile(state.identity));
    }

    return {
      state,
      retryProfile,
      signIn,
      signInWithGoogle,
      signOut,
      signUp,
    };
  };
}
