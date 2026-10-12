import { useNavigate } from 'react-router';
import { useUsers } from '@/ui/composition';
import { Alert } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import { FeedbackMessage } from '@/ui/components/FeedbackMessage';
import { PageContent } from '@/ui/components/PageContent';
import { UsersTable } from '@/ui/admin/users/UsersTable';

export function UsersPage() {
  const navigate = useNavigate();
  const { activate, activatingId, hasError, isLoading, load, users } = useUsers();

  return (
    <PageContent title="Usuários">
      {isLoading && <FeedbackMessage variant="loading">Carregando usuários...</FeedbackMessage>}

      {!isLoading && hasError && (
        <>
          <Alert variant="error">Não foi possível carregar ou atualizar os usuários.</Alert>
          <Button onClick={() => void load()} type="button" variant="secondary">
            Tentar novamente
          </Button>
        </>
      )}

      {!isLoading && !hasError && users.length === 0 && (
        <FeedbackMessage>Nenhum usuário cadastrado.</FeedbackMessage>
      )}

      {!isLoading && !hasError && users.length > 0 && (
        <UsersTable
          activatingId={activatingId}
          onActivate={activate}
          onViewTimeEntries={(userId) => {
            void navigate(`/users/${userId}/time-entries`);
          }}
          users={users}
        />
      )}
    </PageContent>
  );
}
