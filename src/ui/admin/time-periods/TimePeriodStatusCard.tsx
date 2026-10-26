import type { TimePeriod } from '@/domain/time-period';
import { Badge } from '@/ui/components/Badge';
import { Button } from '@/ui/components/Button';
import { formatBusinessShortDateTime } from '@/ui/formatters/business-time';

interface TimePeriodStatusCardProps {
  onRequestClose: () => void;
  period: TimePeriod;
}

export function TimePeriodStatusCard({ onRequestClose, period }: TimePeriodStatusCardProps) {
  const isClosed = period.status === 'CLOSED';

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Badge variant={isClosed ? 'neutral' : 'success'}>{isClosed ? 'Fechado' : 'Aberto'}</Badge>
        <p className="text-sm text-content-secondary">
          {isClosed
            ? period.closedAt
              ? `Fechado em ${formatBusinessShortDateTime(period.closedAt)}. Novas batidas e correções estão bloqueadas.`
              : 'Novas batidas e correções estão bloqueadas.'
            : 'O mês ainda aceita novas batidas e correções.'}
        </p>
      </div>

      {!isClosed && (
        <Button onClick={onRequestClose} type="button">
          Fechar mês
        </Button>
      )}
    </section>
  );
}
