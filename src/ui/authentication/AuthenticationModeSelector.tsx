import type { AuthenticationMode } from '@/ui/authentication/useAuthenticationForm';

interface AuthenticationModeSelectorProps {
  mode: AuthenticationMode;
  onChange: (mode: AuthenticationMode) => void;
}

export function AuthenticationModeSelector({ mode, onChange }: AuthenticationModeSelectorProps) {
  return (
    <div className="mt-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
      <ModeButton
        active={mode === 'sign-in'}
        onClick={() => {
          onChange('sign-in');
        }}
      >
        Entrar
      </ModeButton>
      <ModeButton
        active={mode === 'sign-up'}
        onClick={() => {
          onChange('sign-up');
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
        active ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-950'
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
