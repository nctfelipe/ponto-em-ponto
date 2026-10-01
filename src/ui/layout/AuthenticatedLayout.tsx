import type { Identity } from '@/application/identity/identity-provider';
import { AppShell } from '@/ui/layout/AppShell';
import type { NavigationItem } from '@/ui/layout/NavigationSidebar';

const commonNavigation: NavigationItem[] = [{ label: 'Início', to: '/' }];
const adminNavigation: NavigationItem[] = [{ label: 'Usuários', to: '/users' }];

interface AuthenticatedLayoutProps {
  identity: Identity;
  onSignOut: () => Promise<void>;
}

export function AuthenticatedLayout({ identity, onSignOut }: AuthenticatedLayoutProps) {
  const navigationItems = identity.isAdmin
    ? [...commonNavigation, ...adminNavigation]
    : commonNavigation;

  return <AppShell navigationItems={navigationItems} onSignOut={onSignOut} />;
}
