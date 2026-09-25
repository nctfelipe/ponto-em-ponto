import type {
  SignInCredentials,
  SignUpCredentials,
} from '../../application/identity/identity-provider';
import { PageCard } from '../components/PageCard';
import { AuthenticationForm } from './AuthenticationForm';
import { useAuthenticationForm } from './useAuthenticationForm';

interface AuthenticationPageProps {
  onSignIn: (credentials: SignInCredentials) => Promise<void>;
  onSignUp: (credentials: SignUpCredentials) => Promise<void>;
  onSignInWithGoogle: () => Promise<void>;
}

export function AuthenticationPage(props: AuthenticationPageProps) {
  const form = useAuthenticationForm(props);
  const title = form.mode === 'sign-in' ? 'Acesse sua conta' : 'Crie sua conta';

  return (
    <PageCard eyebrow="Ponto em Ponto" title={title}>
      <AuthenticationForm
        errorMessage={form.errorMessage}
        isSubmitting={form.isSubmitting}
        mode={form.mode}
        onGoogleSignIn={form.signInWithGoogle}
        onModeChange={form.changeMode}
        onSubmit={form.submit}
      />
    </PageCard>
  );
}
