import type { PendingTimePeriodUser } from '@/ui/admin/time-periods/useTimePeriod';
import { Button } from '@/ui/components/Button';

interface PendingTimePeriodUsersProps {
  onReview: (userId: string) => void;
  users: PendingTimePeriodUser[];
}

export function PendingTimePeriodUsers({ onReview, users }: PendingTimePeriodUsersProps) {
  if (users.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface">
      <header className="border-b border-border bg-background px-4 py-3">
        <h3 className="font-semibold text-content">Correções pendentes</h3>
        <p className="mt-1 text-sm text-content-secondary">
          Revise todas as pendências antes de fechar o mês.
        </p>
      </header>
      <ul className="divide-y divide-border">
        {users.map((user) => (
          <li
            className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            key={user.userId}
          >
            <div>
              <p className="font-medium text-content">{user.displayName}</p>
              {user.email && <p className="text-sm text-content-secondary">{user.email}</p>}
              <p className="text-sm text-warning">
                {user.dayCount} {user.dayCount === 1 ? 'dia pendente' : 'dias pendentes'}
              </p>
            </div>
            <Button
              onClick={() => {
                onReview(user.userId);
              }}
              size="small"
              type="button"
              variant="secondary"
            >
              Revisar histórico
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
