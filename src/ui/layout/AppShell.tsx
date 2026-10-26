import { LogOut } from 'lucide-react';
import { Outlet } from 'react-router';
import { Brand } from '@/ui/components/Brand';
import { IconButton } from '@/ui/components/IconButton';
import { NavigationSidebar, type NavigationItem } from '@/ui/layout/NavigationSidebar';

interface AppShellProps {
  navigationItems: NavigationItem[];
  onSignOut: () => Promise<void>;
}

export function AppShell({ navigationItems, onSignOut }: AppShellProps) {
  return (
    <main className="flex min-h-svh flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border border-t-4 border-t-brand-strong bg-brand px-4 py-3 sm:px-6">
        <Brand compactOnMobile />
        <IconButton aria-label="Sair" onClick={() => void onSignOut()} title="Sair" type="button">
          <LogOut aria-hidden="true" size={20} />
        </IconButton>
      </header>
      <div className="flex-1 md:flex">
        <NavigationSidebar items={navigationItems} />
        <div className="min-w-0 flex-1 p-4 pb-24 sm:p-6 sm:pb-24 md:pb-6">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
