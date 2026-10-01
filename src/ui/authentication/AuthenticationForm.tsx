import { AuthenticationDivider } from '@/ui/authentication/AuthenticationDivider';
import { AuthenticationModeSelector } from '@/ui/authentication/AuthenticationModeSelector';
import type { AuthenticationMode } from '@/ui/authentication/useAuthenticationForm';
import { Alert } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import { TextField } from '@/ui/components/TextField';

interface AuthenticationFormProps {
  errorMessage: string | null;
  isSubmitting: boolean;
  mode: AuthenticationMode;
  onModeChange: (mode: AuthenticationMode) => void;
  onGoogleSignIn: () => Promise<void>;
  onSubmit: (event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => Promise<void>;
}

export function AuthenticationForm({
  errorMessage,
  isSubmitting,
  mode,
  onGoogleSignIn,
  onModeChange,
  onSubmit,
}: AuthenticationFormProps) {
  return (
    <>
      <AuthenticationModeSelector mode={mode} onChange={onModeChange} />

      <form className="mt-6 space-y-4" onSubmit={(event) => void onSubmit(event)}>
        {mode === 'sign-up' && (
          <TextField autoComplete="name" label="Nome" name="displayName" required type="text" />
        )}

        <TextField autoComplete="email" label="E-mail" name="email" required type="email" />
        <TextField
          autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
          label="Senha"
          name="password"
          required
          type="password"
        />

        {mode === 'sign-up' && (
          <TextField
            autoComplete="new-password"
            label="Confirme a senha"
            name="passwordConfirmation"
            required
            type="password"
          />
        )}

        {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Aguarde...' : mode === 'sign-in' ? 'Entrar' : 'Criar conta'}
        </Button>
      </form>

      <AuthenticationDivider />

      <Button
        className="w-full"
        disabled={isSubmitting}
        onClick={() => void onGoogleSignIn()}
        type="button"
        variant="secondary"
      >
        Continuar com Google
      </Button>
    </>
  );
}
