import type { Identity } from '@/application/identity/identity-provider';
import type { Profile } from '@/domain/profile';
import { UsersPage } from '@/ui/admin/users/UsersPage';
import { AdminSidebar } from '@/ui/layout/AdminSidebar';
import { AppShell } from '@/ui/layout/AppShell';

interface DashboardProps {
  identity: Identity;
  onProfileApproved: () => Promise<void>;
  onSignOut: () => Promise<void>;
  profile: Profile;
}

export function Dashboard({ identity, onProfileApproved, onSignOut, profile }: DashboardProps) {
  return (
    <AppShell onSignOut={onSignOut} sidebar={identity.isAdmin ? <AdminSidebar /> : undefined}>
      {identity.isAdmin && (
        <UsersPage currentUserId={profile.id} onCurrentUserActivated={onProfileApproved} />
      )}
    </AppShell>
  );
}
