import type { Profile } from '@/domain/profile';
import { Button } from '@/ui/components/Button';

interface UserHistoryContextProps {
  onBack: () => void;
  profile: Profile;
}

export function UserHistoryContext({ onBack, profile }: UserHistoryContextProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-content">{profile.displayName}</p>
        <p className="text-sm text-content-secondary">{profile.email}</p>
      </div>
      <Button onClick={onBack} size="small" type="button" variant="secondary">
        Voltar para usuários
      </Button>
    </div>
  );
}
