import type { ReactNode } from 'react';

type AlertVariant = 'error' | 'info';

interface AlertProps {
  children: ReactNode;
  variant?: AlertVariant;
}

const variantClasses: Record<AlertVariant, string> = {
  error: 'rounded-lg bg-red-50 px-3 py-2 text-red-700',
  info: 'leading-6 text-slate-600',
};

export function Alert({ children, variant = 'info' }: AlertProps) {
  return (
    <p
      className={`text-sm ${variantClasses[variant]}`}
      role={variant === 'error' ? 'alert' : undefined}
    >
      {children}
    </p>
  );
}
