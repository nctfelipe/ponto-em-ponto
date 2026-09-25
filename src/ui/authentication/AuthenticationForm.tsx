import { Button } from '@/ui/components/Button';
import { TextField } from '@/ui/components/TextField';
import type { AuthenticationMode } from '@/ui/authentication/useAuthenticationForm';

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
      <div className="mt-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
        <ModeButton
          active={mode === 'sign-in'}
          onClick={() => {
            onModeChange('sign-in');
          }}
        >
          Entrar
        </ModeButton>
        <ModeButton
          active={mode === 'sign-up'}
          onClick={() => {
            onModeChange('sign-up');
          }}
        >
          Cadastrar
        </ModeButton>
      </div>

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

        {errorMessage && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {errorMessage}
          </p>
        )}

        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Aguarde...' : mode === 'sign-in' ? 'Entrar' : 'Criar conta'}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        ou
        <span className="h-px flex-1 bg-slate-200" />
      </div>

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

interface ModeButtonProps {
  active: boolean;
  children: string;
  onClick: () => void;
}

function ModeButton({ active, children, onClick }: ModeButtonProps) {
  return (
    <button
      className={`rounded-md px-3 py-2 text-sm font-medium transition ${
        active ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-950'
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
