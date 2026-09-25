import type { InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
}

export function TextField({ label, name, ...props }: TextFieldProps) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input
        className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
        name={name}
        {...props}
      />
    </label>
  );
}
