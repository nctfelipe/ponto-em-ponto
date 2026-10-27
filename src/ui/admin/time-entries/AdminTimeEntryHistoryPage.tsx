import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router';
import { UserHistoryContext } from '@/ui/admin/time-entries/UserHistoryContext';
import { Alert } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import { FeedbackMessage } from '@/ui/components/FeedbackMessage';
import { PageContent } from '@/ui/components/PageContent';
import { useUserProfile } from '@/ui/composition';
import { TimeEntryHistory } from '@/ui/time-entry-history/TimeEntryHistory';

interface AdminTimeEntryHistoryPageProps {
  requestedById: string;
}

export function AdminTimeEntryHistoryPage({ requestedById }: AdminTimeEntryHistoryPageProps) {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const monthKey = searchParams.get('month');
  const initialMonthKey =
    monthKey && /^\d{4}-(0[1-9]|1[0-2])$/.test(monthKey) ? monthKey : undefined;
  const fromTimePeriods = searchParams.get('from') === 'time-periods';

  if (!userId) return <Navigate replace to="/users" />;

  return (
    <AdminTimeEntryHistoryContent
      userId={userId}
      requestedById={requestedById}
      initialMonthKey={initialMonthKey}
      backLabel={fromTimePeriods ? 'Voltar para fechamentos' : undefined}
      onBack={() => {
        void navigate(
          fromTimePeriods && initialMonthKey ? `/time-periods?month=${initialMonthKey}` : '/users',
        );
      }}
    />
  );
}

interface AdminTimeEntryHistoryContentProps {
  backLabel?: string | undefined;
  initialMonthKey?: string | undefined;
  onBack: () => void;
  requestedById: string;
  userId: string;
}

function AdminTimeEntryHistoryContent({
  backLabel,
  initialMonthKey,
  onBack,
  requestedById,
  userId,
}: AdminTimeEntryHistoryContentProps) {
  const userProfile = useUserProfile(userId);

  return (
    <PageContent title="Histórico de batidas">
      {userProfile.isLoading && (
        <FeedbackMessage variant="loading">Carregando usuário...</FeedbackMessage>
      )}

      {!userProfile.isLoading && userProfile.hasError && (
        <>
          <Alert variant="error">Não foi possível carregar o usuário.</Alert>
          <Button onClick={userProfile.load} type="button" variant="secondary">
            Tentar novamente
          </Button>
        </>
      )}

      {!userProfile.isLoading && !userProfile.hasError && !userProfile.profile && (
        <>
          <Alert variant="error">Usuário não encontrado.</Alert>
          <Button onClick={onBack} type="button" variant="secondary">
            Voltar para usuários
          </Button>
        </>
      )}

      {!userProfile.isLoading && !userProfile.hasError && userProfile.profile && (
        <>
          <UserHistoryContext backLabel={backLabel} onBack={onBack} profile={userProfile.profile} />
          <TimeEntryHistory
            canApplyDirectly
            initialMonthKey={initialMonthKey}
            requestedById={requestedById}
            userId={userId}
          />
        </>
      )}
    </PageContent>
  );
}
