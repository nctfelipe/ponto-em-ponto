import type { Profile } from '@/domain/profile';
import { Button } from '@/ui/components/Button';

interface PendingProfileItemProps {
  isApproving: boolean;
  onApprove: () => Promise<void>;
  profile: Profile;
}

export function PendingProfileItem({ isApproving, onApprove, profile }: PendingProfileItemProps) {
  return (
    <li className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-slate-950">{profile.displayName}</p>
        <p className="text-sm text-slate-600">{profile.email}</p>
      </div>
      <Button disabled={isApproving} onClick={() => void onApprove()} type="button">
        {isApproving ? 'Aprovando...' : 'Aprovar'}
      </Button>
    </li>
  );
}
