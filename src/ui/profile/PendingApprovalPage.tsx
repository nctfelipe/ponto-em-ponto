import { Alert } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import { PageCard } from '@/ui/components/PageCard';

interface PendingApprovalPageProps {
  onSignOut: () => Promise<void>;
}

export function PendingApprovalPage({ onSignOut }: PendingApprovalPageProps) {
  return (
    <PageCard title="Cadastro em análise">
      <div className="mt-3">
        <Alert>Seu cadastro está aguardando a aprovação de um administrador.</Alert>
      </div>
      <Button className="mt-6" onClick={() => void onSignOut()} type="button" variant="secondary">
        Sair
      </Button>
    </PageCard>
  );
}
