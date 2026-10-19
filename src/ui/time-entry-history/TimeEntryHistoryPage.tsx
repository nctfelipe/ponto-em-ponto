import { PageContent } from '@/ui/components/PageContent';
import { TimeEntryHistory } from '@/ui/time-entry-history/TimeEntryHistory';

interface TimeEntryHistoryPageProps {
  canApplyDirectly: boolean;
  requestedById: string;
  userId: string;
}

export function TimeEntryHistoryPage({
  canApplyDirectly,
  requestedById,
  userId,
}: TimeEntryHistoryPageProps) {
  return (
    <PageContent title="Histórico de batidas">
      <TimeEntryHistory
        canApplyDirectly={canApplyDirectly}
        requestedById={requestedById}
        userId={userId}
      />
    </PageContent>
  );
}
