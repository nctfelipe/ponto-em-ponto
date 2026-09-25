import { useState, type SyntheticEvent } from 'react';
import type {
  SignInCredentials,
  SignUpCredentials,
} from '../../application/identity/identity-provider';

export type AuthenticationMode = 'sign-in' | 'sign-up';

interface UseAuthenticationFormOptions {
  onSignIn: (credentials: SignInCredentials) => Promise<void>;
  onSignUp: (credentials: SignUpCredentials) => Promise<void>;
  onSignInWithGoogle: () => Promise<void>;
}

export function useAuthenticationForm(options: UseAuthenticationFormOptions) {
  const [mode, setMode] = useState<AuthenticationMode>('sign-in');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function changeMode(nextMode: AuthenticationMode) {
    setMode(nextMode);
    setErrorMessage(null);
  }

  async function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    if (typeof email !== 'string' || typeof password !== 'string') return;

    setIsSubmitting(true);

    try {
      if (mode === 'sign-in') {
        await options.onSignIn({ email, password });
        return;
      }

      const displayName = formData.get('displayName');
      const passwordConfirmation = formData.get('passwordConfirmation');

      if (typeof displayName !== 'string' || typeof passwordConfirmation !== 'string') return;

      if (password !== passwordConfirmation) {
        setErrorMessage('As senhas informadas não coincidem.');
        return;
      }

      await options.onSignUp({ displayName, email, password });
    } catch {
      setErrorMessage(
        mode === 'sign-in'
          ? 'Não foi possível entrar. Verifique suas credenciais e tente novamente.'
          : 'Não foi possível concluir o cadastro. Verifique os dados e tente novamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function signInWithGoogle() {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await options.onSignInWithGoogle();
    } catch {
      setErrorMessage('Não foi possível entrar com o Google. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    changeMode,
    errorMessage,
    isSubmitting,
    mode,
    signInWithGoogle,
    submit,
  };
}
