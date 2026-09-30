import { useUsers } from '@/ui/composition';
import { Button } from '@/ui/components/Button';
import { UsersTable } from '@/ui/admin/users/UsersTable';

export function UsersPage() {
  const { activate, activatingId, hasError, isLoading, load, users } = useUsers();

  if (isLoading) return <p role="status">Carregando usuários...</p>;

  if (hasError) {
    return (
      <section>
        <p role="alert">Não foi possível carregar ou atualizar os usuários.</p>
        <Button onClick={() => void load()} type="button" variant="secondary">
          Tentar novamente
        </Button>
      </section>
    );
  }

  return (
    <section>
      <h2>Usuários</h2>
      {users.length === 0 ? (
        <p>Nenhum usuário cadastrado.</p>
      ) : (
        <UsersTable activatingId={activatingId} onActivate={activate} users={users} />
      )}
    </section>
  );
}
