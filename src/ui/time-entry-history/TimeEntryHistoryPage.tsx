import { PageContent } from '@/ui/components/PageContent';
import { TimeEntryHistory } from '@/ui/time-entry-history/TimeEntryHistory';

interface TimeEntryHistoryPageProps {
  userId: string;
}

export function TimeEntryHistoryPage({ userId }: TimeEntryHistoryPageProps) {
  return (
    <PageContent title="Histórico de batidas">
      <TimeEntryHistory userId={userId} />
    </PageContent>
  );
}
