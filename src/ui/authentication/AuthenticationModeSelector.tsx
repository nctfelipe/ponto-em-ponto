import type { AuthenticationMode } from '@/ui/authentication/useAuthenticationForm';
import { SegmentedControl } from '@/ui/components/SegmentedControl';

interface AuthenticationModeSelectorProps {
  mode: AuthenticationMode;
  onChange: (mode: AuthenticationMode) => void;
}

export function AuthenticationModeSelector({ mode, onChange }: AuthenticationModeSelectorProps) {
  return (
    <div className="mt-6">
      <SegmentedControl
        onChange={onChange}
        options={[
          { label: 'Entrar', value: 'authenticate' },
          { label: 'Cadastrar', value: 'register' },
        ]}
        value={mode}
      />
    </div>
  );
}
