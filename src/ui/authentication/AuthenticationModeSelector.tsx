import type { AuthenticationMode } from '@/ui/authentication/useAuthenticationForm';

interface AuthenticationModeSelectorProps {
  mode: AuthenticationMode;
  onChange: (mode: AuthenticationMode) => void;
}

export function AuthenticationModeSelector({ mode, onChange }: AuthenticationModeSelectorProps) {
  return (
    <div className="mt-6 grid grid-cols-2 rounded-lg bg-surface-muted p-1">
      <ModeButton
        active={mode === 'authenticate'}
        onClick={() => {
          onChange('authenticate');
        }}
      >
        Entrar
      </ModeButton>
      <ModeButton
        active={mode === 'register'}
        onClick={() => {
          onChange('register');
        }}
      >
        Cadastrar
      </ModeButton>
    </div>
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
        active ? 'bg-surface text-content shadow-sm' : 'text-content-secondary hover:text-content'
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
