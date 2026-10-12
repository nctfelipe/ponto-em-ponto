import type { Profile } from '@/domain/profile';
import { Badge } from '@/ui/components/Badge';
import { Button } from '@/ui/components/Button';
import { DataList, DataListBody, DataListHeader, DataListRow } from '@/ui/components/DataList';

interface UsersTableProps {
  activatingId: string | null;
  onActivate: (user: Profile) => Promise<void>;
  onViewTimeEntries: (userId: string) => void;
  users: Profile[];
}

const statusPresentation: Record<
  Profile['status'],
  { label: string; variant: 'success' | 'warning' }
> = {
  ACTIVE: { label: 'Ativo', variant: 'success' },
  PENDING: { label: 'Pendente', variant: 'warning' },
};

export function UsersTable({
  activatingId,
  onActivate,
  onViewTimeEntries,
  users,
}: UsersTableProps) {
  return (
    <DataList>
      <DataListHeader className="grid-cols-[minmax(10rem,1fr)_minmax(14rem,1.5fr)_8rem_13rem]">
        <span>Nome</span>
        <span>E-mail</span>
        <span>Status</span>
        <span className="text-right">Ações</span>
      </DataListHeader>

      <DataListBody>
        {users.map((user) => {
          const status = statusPresentation[user.status];

          return (
            <DataListRow
              className="md:grid-cols-[minmax(10rem,1fr)_minmax(14rem,1.5fr)_8rem_13rem]"
              key={user.id}
            >
              <div className="flex items-center justify-between gap-3 md:block">
                <span className="font-medium text-content">{user.displayName}</span>
                <span className="md:hidden">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </span>
              </div>

              <span className="text-content-secondary">{user.email}</span>

              <span className="hidden md:block">
                <Badge variant={status.variant}>{status.label}</Badge>
              </span>

              <div className="flex flex-wrap gap-2 md:justify-end">
                <Button
                  onClick={() => {
                    onViewTimeEntries(user.id);
                  }}
                  size="small"
                  type="button"
                  variant="secondary"
                >
                  Ver batidas
                </Button>
                {user.status === 'PENDING' && (
                  <Button
                    disabled={activatingId === user.id}
                    onClick={() => void onActivate(user)}
                    size="small"
                    type="button"
                  >
                    {activatingId === user.id ? 'Ativando...' : 'Ativar'}
                  </Button>
                )}
              </div>
            </DataListRow>
          );
        })}
      </DataListBody>
    </DataList>
  );
}
