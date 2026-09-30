import type { ReactNode } from 'react';
import { Button } from '@/ui/components/Button';

interface AppShellProps {
  children?: ReactNode;
  onSignOut: () => Promise<void>;
  sidebar?: ReactNode;
}

export function AppShell({ children, onSignOut, sidebar }: AppShellProps) {
  return (
    <main className="min-h-svh bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-slate-950">Ponto em Ponto</h1>
        <Button onClick={() => void onSignOut()} type="button" variant="secondary">
          Sair
        </Button>
      </header>
      <div className="md:flex">
        {sidebar}
        <div className="min-w-0 flex-1 p-6">{children}</div>
      </div>
    </main>
  );
}
