import { Button } from '@/ui/components/Button';
import { MonthSelector } from '@/ui/time-entry-history/MonthSelector';

interface TimeEntryHistoryControlsProps {
  monthKey: string;
  onAdd: () => void;
  onMonthChange: (monthKey: string) => void;
}

export function TimeEntryHistoryControls({
  monthKey,
  onAdd,
  onMonthChange,
}: TimeEntryHistoryControlsProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <MonthSelector monthKey={monthKey} onChange={onMonthChange} />
      <Button onClick={onAdd} type="button">
        Solicitar inclusão
      </Button>
    </div>
  );
}
