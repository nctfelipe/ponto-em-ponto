import { CheckCircle2, CircleX, Clock3, TriangleAlert, type LucideIcon } from 'lucide-react';
import type { DayStatus } from '@/ui/time-entry-history/day-status';

interface DayStatusIndicatorProps {
  status: DayStatus | null;
}

const presentation: Record<DayStatus, { icon: LucideIcon; label: string; style: string }> = {
  ADJUSTED: { icon: CheckCircle2, label: 'Dia ajustado', style: 'text-success' },
  INCONSISTENT: {
    icon: TriangleAlert,
    label: 'Quantidade ímpar de batidas',
    style: 'text-danger',
  },
  PENDING: { icon: Clock3, label: 'Correção pendente', style: 'text-warning' },
  REJECTED: { icon: CircleX, label: 'Correção rejeitada', style: 'text-danger' },
};

export function DayStatusIndicator({ status }: DayStatusIndicatorProps) {
  if (!status) return <span aria-hidden="true" />;

  const { icon: Icon, label, style } = presentation[status];

  return (
    <span
      aria-label={label}
      className="group relative inline-flex w-fit outline-none"
      role="img"
      tabIndex={0}
    >
      <Icon aria-hidden="true" className={style} size={18} strokeWidth={2} />
      <span
        className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 hidden whitespace-nowrap rounded-md bg-content px-2 py-1 text-xs text-surface shadow-sm group-hover:block group-focus:block"
        role="tooltip"
      >
        {label}
      </span>
    </span>
  );
}
