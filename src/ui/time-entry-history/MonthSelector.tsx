interface MonthSelectorProps {
  monthKey: string;
  onChange: (monthKey: string) => void;
}

export function MonthSelector({ monthKey, onChange }: MonthSelectorProps) {
  return (
    <InputField
      label="Mês"
      onChange={(event) => {
        onChange(event.target.value);
      }}
      type="month"
      value={monthKey}
      width="compact"
    />
  );
}
import { InputField } from '@/ui/components/InputField';
