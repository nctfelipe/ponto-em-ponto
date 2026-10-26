import { CalendarCheck, Clock, House, Users } from 'lucide-react';
import type { Identity } from '@/application/identity/identity-provider';
import { AppShell } from '@/ui/layout/AppShell';
import type { NavigationItem } from '@/ui/layout/NavigationSidebar';

const commonNavigation: NavigationItem[] = [
  { icon: House, label: 'Início', to: '/' },
  { icon: Clock, label: 'Histórico', to: '/time-entries' },
];
const adminNavigation: NavigationItem[] = [
  { icon: Users, label: 'Usuários', to: '/users' },
  { icon: CalendarCheck, label: 'Fechamentos', to: '/time-periods' },
];

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
