import { PageContent } from '@/ui/components/PageContent';
import { TimeEntryHistory } from '@/ui/time-entry-history/TimeEntryHistory';

interface TimeEntryHistoryPageProps {
  requestedById: string;
  userId: string;
}

export function TimeEntryHistoryPage({ requestedById, userId }: TimeEntryHistoryPageProps) {
  return (
    <PageContent title="Histórico de batidas">
      <TimeEntryHistory requestedById={requestedById} userId={userId} />
    </PageContent>
  );
}
