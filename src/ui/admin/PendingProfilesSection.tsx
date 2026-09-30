import type { ProfileRepository } from '@/application/profiles/profile-repository';
import { PendingProfileItem } from '@/ui/admin/PendingProfileItem';
import { usePendingProfiles } from '@/ui/admin/usePendingProfiles';
import { Button } from '@/ui/components/Button';

interface PendingProfilesSectionProps {
  currentProfileId: string;
  onCurrentProfileApproved: () => Promise<void>;
  profileRepository: ProfileRepository;
}

export function PendingProfilesSection({
  currentProfileId,
  onCurrentProfileApproved,
  profileRepository,
}: PendingProfilesSectionProps) {
  const { approve, approvingId, hasError, isLoading, load, profiles } = usePendingProfiles({
    currentProfileId,
    onCurrentProfileApproved,
    profileRepository,
  });

  return (
    <section className="mt-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-lg font-semibold text-slate-950">Cadastros pendentes</h2>

      {isLoading && (
        <p className="mt-4 text-sm text-slate-600" role="status">
          Carregando cadastros...
        </p>
      )}

      {!isLoading && hasError && (
        <div className="mt-4">
          <p className="text-sm text-red-700" role="alert">
            Não foi possível carregar ou aprovar os cadastros.
          </p>
          <Button className="mt-4" onClick={() => void load()} type="button" variant="secondary">
            Tentar novamente
          </Button>
        </div>
      )}

      {!isLoading && !hasError && profiles.length === 0 && (
        <p className="mt-4 text-sm text-slate-600">Não há cadastros aguardando aprovação.</p>
      )}

      {!isLoading && profiles.length > 0 && (
        <ul className="mt-4 space-y-3">
          {profiles.map((profile) => (
            <PendingProfileItem
              isApproving={approvingId === profile.id}
              key={profile.id}
              onApprove={() => approve(profile)}
              profile={profile}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
