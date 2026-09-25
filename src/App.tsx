import { FirebaseIdentityProvider } from './infrastructure/firebase/auth/firebase-identity-provider';
import { FirestoreProfileRepository } from './infrastructure/firebase/firestore/firestore-profile-repository';
import { AuthenticationPage } from './ui/authentication/AuthenticationPage';
import { Dashboard } from './ui/dashboard/Dashboard';
import { AccessErrorPage } from './ui/feedback/AccessErrorPage';
import { LoadingPage } from './ui/feedback/LoadingPage';
import { useSession } from './ui/session/useSession';

const identityProvider = new FirebaseIdentityProvider();
const profileRepository = new FirestoreProfileRepository();

function App() {
  const session = useSession({ identityProvider, profileRepository });

  if (session.state.status === 'loading') return <LoadingPage />;

  if (session.state.status === 'anonymous') {
    return (
      <AuthenticationPage
        onSignIn={session.signIn}
        onSignInWithGoogle={session.signInWithGoogle}
        onSignUp={session.signUp}
      />
    );
  }

  if (session.state.status === 'profile-missing') {
    return <AccessErrorPage onRetry={session.retryProfile} onSignOut={session.signOut} />;
  }

  if (session.state.status === 'error') {
    return (
      <AccessErrorPage
        onRetry={() => {
          window.location.reload();
        }}
        onSignOut={session.signOut}
      />
    );
  }

  return <Dashboard onSignOut={session.signOut} />;
}

export default App;
