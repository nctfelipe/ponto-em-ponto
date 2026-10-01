import { useState } from 'react';
import { Alert } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import { ConfirmationDialog } from '@/ui/components/ConfirmationDialog';
import { PageContent } from '@/ui/components/PageContent';
import { useTimeEntries } from '@/ui/composition';
import { TimeClockCard } from '@/ui/time-entries/TimeClockCard';
import { TimeEntryList } from '@/ui/time-entries/TimeEntryList';

interface HomePageProps {
  userId: string;
}

export function HomePage({ userId }: HomePageProps) {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const timeEntries = useTimeEntries(userId);

  async function confirmRecord() {
    await timeEntries.record();
    setIsConfirmationOpen(false);
  }

  return (
    <PageContent title="Registro de ponto" width="narrow">
      <TimeClockCard
        canRecord={timeEntries.canRecord}
        currentDateLabel={timeEntries.currentDateLabel}
        entryCount={timeEntries.entries.length}
        isRegistering={timeEntries.isRegistering}
        onRequestRecord={() => {
          setIsConfirmationOpen(true);
        }}
      />

      {timeEntries.errorMessage && <Alert variant="error">{timeEntries.errorMessage}</Alert>}

      {timeEntries.isLoading ? (
        <p role="status">Carregando batidas...</p>
      ) : (
        <TimeEntryList entries={timeEntries.entries} />
      )}

      {timeEntries.errorMessage && !timeEntries.isLoading && (
        <Button onClick={() => void timeEntries.load()} type="button" variant="secondary">
          Tentar novamente
        </Button>
      )}

      <ConfirmationDialog
        confirmLabel="Confirmar"
        description="O horário oficial será definido pelo servidor no momento da confirmação."
        isConfirming={timeEntries.isRegistering}
        isOpen={isConfirmationOpen}
        onCancel={() => {
          setIsConfirmationOpen(false);
        }}
        onConfirm={confirmRecord}
        title="Confirmar registro de ponto?"
      />
    </PageContent>
  );
}
