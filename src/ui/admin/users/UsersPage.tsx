import { useUsers } from '@/ui/composition';
import { Alert } from '@/ui/components/Alert';
import { Button } from '@/ui/components/Button';
import { PageContent } from '@/ui/components/PageContent';
import { UsersTable } from '@/ui/admin/users/UsersTable';

export function UsersPage() {
  const { activate, activatingId, hasError, isLoading, load, users } = useUsers();

  return (
    <PageContent title="Usuários">
      {isLoading && <p role="status">Carregando usuários...</p>}

      {!isLoading && hasError && (
        <>
          <Alert variant="error">Não foi possível carregar ou atualizar os usuários.</Alert>
          <Button onClick={() => void load()} type="button" variant="secondary">
            Tentar novamente
          </Button>
        </>
      )}

      {!isLoading && !hasError && users.length === 0 && <p>Nenhum usuário cadastrado.</p>}

      {!isLoading && !hasError && users.length > 0 && (
        <UsersTable activatingId={activatingId} onActivate={activate} users={users} />
      )}
    </PageContent>
  );
}
