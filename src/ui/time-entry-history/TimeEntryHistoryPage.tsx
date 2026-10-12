import { Alert } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import { FeedbackMessage } from '@/ui/components/FeedbackMessage';
import { PageContent } from '@/ui/components/PageContent';
import { useTimeEntryHistory } from '@/ui/composition';
import { MonthSelector } from '@/ui/time-entry-history/MonthSelector';
import { TimeEntryHistoryList } from '@/ui/time-entry-history/TimeEntryHistoryList';

interface TimeEntryHistoryPageProps {
  userId: string;
}

export function TimeEntryHistoryPage({ userId }: TimeEntryHistoryPageProps) {
  const history = useTimeEntryHistory(userId);

  return (
    <PageContent title="Histórico de batidas">
      <MonthSelector monthKey={history.monthKey} onChange={history.selectMonth} />

      {history.isLoading && (
        <FeedbackMessage variant="loading">Carregando histórico...</FeedbackMessage>
      )}

      {!history.isLoading && history.hasError && (
        <>
          <Alert variant="error">Não foi possível carregar o histórico.</Alert>
          <Button onClick={history.load} type="button" variant="secondary">
            Tentar novamente
          </Button>
        </>
      )}

      {!history.isLoading && !history.hasError && <TimeEntryHistoryList days={history.days} />}
    </PageContent>
  );
}
