import { Navigate, Route, Routes } from 'react-router';
import { UsersPage } from '@/ui/admin/users/UsersPage';
import { AuthenticationPage } from '@/ui/authentication/AuthenticationPage';
import { useSession } from '@/ui/composition';
import { AccessErrorPage } from '@/ui/feedback/AccessErrorPage';
import { LoadingPage } from '@/ui/feedback/LoadingPage';
import { HomePage } from '@/ui/home/HomePage';
import { AuthenticatedLayout } from '@/ui/layout/AuthenticatedLayout';
import { PendingApprovalPage } from '@/ui/profile/PendingApprovalPage';

function App() {
  const session = useSession();

  if (session.state.status === 'loading') return <LoadingPage />;

  if (session.state.status === 'anonymous') {
    return (
      <Routes>
        <Route
          element={
            <AuthenticationPage
              onSignIn={session.signIn}
              onSignInWithGoogle={session.signInWithGoogle}
              onSignUp={session.signUp}
            />
          }
          path="/login"
        />
        <Route element={<Navigate replace to="/login" />} path="*" />
      </Routes>
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

  const { identity, profile } = session.state;

  if (profile.status === 'PENDING') {
    return (
      <Routes>
        <Route element={<PendingApprovalPage onSignOut={session.signOut} />} path="/pending" />
        <Route element={<Navigate replace to="/pending" />} path="*" />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AuthenticatedLayout identity={identity} onSignOut={session.signOut} />}>
        <Route element={<HomePage />} index />
        {identity.isAdmin && <Route element={<UsersPage />} path="users" />}
      </Route>
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}

export default App;
