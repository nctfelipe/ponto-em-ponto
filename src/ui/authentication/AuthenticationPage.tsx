import type {
  AuthenticationCredentials,
  RegistrationCredentials,
} from '@/application/identity/identity-provider';
import { Brand } from '@/ui/components/Brand';
import { PageCard } from '@/ui/components/PageCard';
import { AuthenticationForm } from '@/ui/authentication/AuthenticationForm';
import { useAuthenticationForm } from '@/ui/authentication/useAuthenticationForm';

interface AuthenticationPageProps {
  onAuthenticate: (credentials: AuthenticationCredentials) => Promise<void>;
  onRegister: (credentials: RegistrationCredentials) => Promise<void>;
  onAuthenticateWithGoogle: () => Promise<void>;
}

export function AuthenticationPage(props: AuthenticationPageProps) {
  const form = useAuthenticationForm(props);
  const title = form.mode === 'authenticate' ? 'Acesse sua conta' : 'Crie sua conta';

  return (
    <PageCard eyebrow={<Brand />} title={title}>
      <AuthenticationForm
        errorMessage={form.errorMessage}
        isSubmitting={form.isSubmitting}
        mode={form.mode}
        onAuthenticateWithGoogle={form.authenticateWithGoogle}
        onModeChange={form.changeMode}
        onSubmit={form.submit}
      />
    </PageCard>
  );
}
