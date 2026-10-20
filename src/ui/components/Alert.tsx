import type { ReactNode } from 'react';

type AlertVariant = 'error' | 'info' | 'success';

interface AlertProps {
  children: ReactNode;
  variant?: AlertVariant;
}

const variantClasses: Record<AlertVariant, string> = {
  error: 'rounded-lg bg-danger-subtle px-3 py-2 text-danger',
  info: 'leading-6 text-content-secondary',
  success: 'rounded-lg bg-success-subtle px-3 py-2 text-success',
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
