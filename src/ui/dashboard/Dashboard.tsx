import type { Identity } from '@/application/identity/identity-provider';
import type { ProfileRepository } from '@/application/profiles/profile-repository';
import type { Profile } from '@/domain/profile';
import { PendingProfilesSection } from '@/ui/admin/PendingProfilesSection';
import { Button } from '@/ui/components/Button';

interface DashboardProps {
  identity: Identity;
  onProfileApproved: () => Promise<void>;
  onSignOut: () => Promise<void>;
  profile: Profile;
  profileRepository: ProfileRepository;
}

export function Dashboard({
  identity,
  onProfileApproved,
  onSignOut,
  profile,
  profileRepository,
}: DashboardProps) {
  return (
    <main className="min-h-svh bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-950">Ponto em Ponto</h1>
          <Button onClick={() => void onSignOut()} type="button" variant="secondary">
            Sair
          </Button>
        </header>

        {identity.isAdmin && (
          <PendingProfilesSection
            currentProfileId={profile.id}
            onCurrentProfileApproved={onProfileApproved}
            profileRepository={profileRepository}
          />
        )}
      </div>
    </main>
  );
}
