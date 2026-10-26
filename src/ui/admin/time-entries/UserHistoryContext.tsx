import type { Profile } from '@/domain/profile';
import { Button } from '@/ui/components/Button';

interface UserHistoryContextProps {
  backLabel?: string | undefined;
  onBack: () => void;
  profile: Profile;
}

export function UserHistoryContext({
  backLabel = 'Voltar para usuários',
  onBack,
  profile,
}: UserHistoryContextProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-content">{profile.displayName}</p>
        <p className="text-sm text-content-secondary">{profile.email}</p>
      </div>
      <Button onClick={onBack} size="small" type="button" variant="secondary">
        {backLabel}
      </Button>
    </div>
  );
}
