import type { InputHTMLAttributes } from 'react';

type InputFieldWidth = 'compact' | 'full';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  width?: InputFieldWidth;
}

const widthClasses: Record<InputFieldWidth, string> = {
  compact: 'max-w-xs',
  full: 'w-full',
};

export function InputField({ className = '', label, width = 'full', ...props }: InputFieldProps) {
  return (
    <label className={`block text-sm font-medium text-content-secondary ${widthClasses[width]}`}>
      {label}
      <input
        className={`mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-content outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/15 ${className}`}
        {...props}
      />
    </label>
  );
}
