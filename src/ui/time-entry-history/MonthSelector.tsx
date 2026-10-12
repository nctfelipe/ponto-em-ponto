interface MonthSelectorProps {
  monthKey: string;
  onChange: (monthKey: string) => void;
}

export function MonthSelector({ monthKey, onChange }: MonthSelectorProps) {
  return (
    <label className="block max-w-xs text-sm font-medium text-slate-700">
      Mês
      <input
        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950"
        onChange={(event) => {
          onChange(event.target.value);
        }}
        type="month"
        value={monthKey}
      />
    </label>
  );
}
