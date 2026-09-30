import type { Profile } from '@/domain/profile';
import { Button } from '@/ui/components/Button';

interface UsersTableProps {
  activatingId: string | null;
  onActivate: (user: Profile) => Promise<void>;
  users: Profile[];
}

const statusLabels: Record<Profile['status'], string> = {
  ACTIVE: 'Ativo',
  PENDING: 'Pendente',
};

export function UsersTable({ activatingId, onActivate, users }: UsersTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-slate-700">
          <tr>
            <th className="px-4 py-3 font-semibold">Nome</th>
            <th className="px-4 py-3 font-semibold">E-mail</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 text-right font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-3 font-medium text-slate-950">{user.displayName}</td>
              <td className="px-4 py-3 text-slate-600">{user.email}</td>
              <td className="px-4 py-3 text-slate-600">{statusLabels[user.status]}</td>
              <td className="px-4 py-3 text-right">
                {user.status === 'PENDING' && (
                  <Button
                    disabled={activatingId === user.id}
                    onClick={() => void onActivate(user)}
                    type="button"
                  >
                    {activatingId === user.id ? 'Ativando...' : 'Ativar'}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
