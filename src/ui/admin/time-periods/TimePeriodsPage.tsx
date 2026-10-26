import { useState } from 'react';
import { Alert } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import { ConfirmationDialog } from '@/ui/components/ConfirmationDialog';
import { FeedbackMessage } from '@/ui/components/FeedbackMessage';
import { PageContent } from '@/ui/components/PageContent';
import { useTimePeriod } from '@/ui/composition';
import { TimePeriodStatusCard } from '@/ui/admin/time-periods/TimePeriodStatusCard';
import { MonthSelector } from '@/ui/time-entry-history/MonthSelector';

interface TimePeriodsPageProps {
  adminId: string;
}

export function TimePeriodsPage({ adminId }: TimePeriodsPageProps) {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const timePeriod = useTimePeriod(adminId);

  async function closePeriod() {
    await timePeriod.close();
    setIsConfirmationOpen(false);
  }

  return (
    <PageContent title="Fechamento mensal" width="narrow">
      <MonthSelector monthKey={timePeriod.monthKey} onChange={timePeriod.selectMonth} />

      {timePeriod.isLoading && (
        <FeedbackMessage variant="loading">Carregando período...</FeedbackMessage>
      )}

      {!timePeriod.isLoading && timePeriod.errorMessage && (
        <>
          <Alert variant="error">{timePeriod.errorMessage}</Alert>
          {!timePeriod.period && (
            <Button onClick={timePeriod.load} type="button" variant="secondary">
              Tentar novamente
            </Button>
          )}
        </>
      )}

      {!timePeriod.isLoading && timePeriod.period && (
        <TimePeriodStatusCard
          onRequestClose={() => {
            setIsConfirmationOpen(true);
          }}
          period={timePeriod.period}
        />
      )}

      <ConfirmationDialog
        confirmLabel="Fechar mês"
        confirmVariant="danger"
        description="O fechamento será aplicado a todos os usuários e não poderá ser desfeito. Novas batidas, correções e decisões ficarão bloqueadas para este mês."
        isConfirming={timePeriod.isClosing}
        isOpen={isConfirmationOpen}
        onCancel={() => {
          if (!timePeriod.isClosing) setIsConfirmationOpen(false);
        }}
        onConfirm={closePeriod}
        title="Confirmar fechamento do mês?"
      />
    </PageContent>
  );
}
