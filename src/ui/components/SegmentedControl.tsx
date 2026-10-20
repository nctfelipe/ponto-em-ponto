interface SegmentedControlOption<Value extends string> {
  label: string;
  value: Value;
}

interface SegmentedControlProps<Value extends string> {
  onChange: (value: Value) => void;
  options: SegmentedControlOption<Value>[];
  value: Value;
}

export function SegmentedControl<Value extends string>({
  onChange,
  options,
  value,
}: SegmentedControlProps<Value>) {
  return (
    <div
      className="grid rounded-lg bg-surface-muted p-1"
      style={{ gridTemplateColumns: `repeat(${String(options.length)}, 1fr)` }}
    >
      {options.map((option) => (
        <button
          className={`rounded-md px-3 py-2 text-sm font-medium transition ${
            value === option.value
              ? 'bg-surface text-content shadow-sm'
              : 'text-content-secondary hover:text-content'
          }`}
          key={option.value}
          onClick={() => {
            onChange(option.value);
          }}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
