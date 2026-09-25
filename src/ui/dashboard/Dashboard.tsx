import { Button } from '@/ui/components/Button';

interface DashboardProps {
  onSignOut: () => Promise<void>;
}

export function Dashboard({ onSignOut }: DashboardProps) {
  return (
    <main className="min-h-svh bg-slate-50 px-6 py-8">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-950">Ponto em Ponto</h1>
        <Button onClick={() => void onSignOut()} type="button" variant="secondary">
          Sair
        </Button>
      </div>
    </main>
  );
}
