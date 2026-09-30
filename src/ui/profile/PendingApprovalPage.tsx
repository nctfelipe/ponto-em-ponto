import { Button } from '@/ui/components/Button';
import { PageCard } from '@/ui/components/PageCard';

interface PendingApprovalPageProps {
  onSignOut: () => Promise<void>;
}

export function PendingApprovalPage({ onSignOut }: PendingApprovalPageProps) {
  return (
    <PageCard title="Cadastro em análise">
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Seu cadastro está aguardando a aprovação de um administrador.
      </p>
      <Button className="mt-6" onClick={() => void onSignOut()} type="button" variant="secondary">
        Sair
      </Button>
    </PageCard>
  );
}
