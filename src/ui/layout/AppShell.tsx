import { Outlet } from 'react-router';
import { Button } from '@/ui/components/Button';
import { NavigationSidebar, type NavigationItem } from '@/ui/layout/NavigationSidebar';

interface AppShellProps {
  navigationItems: NavigationItem[];
  onSignOut: () => Promise<void>;
}

export function AppShell({ navigationItems, onSignOut }: AppShellProps) {
  return (
    <main className="flex min-h-svh flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-slate-950">Ponto em Ponto</h1>
        <Button onClick={() => void onSignOut()} type="button" variant="secondary">
          Sair
        </Button>
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
