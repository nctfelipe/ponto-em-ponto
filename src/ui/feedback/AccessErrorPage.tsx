import { useState } from 'react';
import { Button } from '@/ui/components/Button';
import { PageCard } from '@/ui/components/PageCard';

interface AccessErrorPageProps {
  onRetry: () => Promise<void> | void;
  onSignOut: () => Promise<void>;
}

export function AccessErrorPage({ onRetry, onSignOut }: AccessErrorPageProps) {
  const [isBusy, setIsBusy] = useState(false);

  async function run(action: () => Promise<void> | void) {
    setIsBusy(true);

    try {
      await action();
    } catch {
      return;
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <PageCard title="Ponto em Ponto">
      <p className="mt-3 text-sm leading-6 text-slate-600" role="alert">
        Não foi possível concluir seu acesso. Tente novamente.
      </p>
      <div className="mt-6 flex gap-3">
        <Button disabled={isBusy} onClick={() => void run(onRetry)} type="button">
          Tentar novamente
        </Button>
        <Button
          disabled={isBusy}
          onClick={() => void run(onSignOut)}
          type="button"
          variant="secondary"
        >
          Sair
        </Button>
      </div>
    </PageCard>
  );
}
