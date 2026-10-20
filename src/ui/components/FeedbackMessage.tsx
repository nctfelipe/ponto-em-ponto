import type { ReactNode } from 'react';

type FeedbackMessageVariant = 'empty' | 'loading';

interface FeedbackMessageProps {
  children: ReactNode;
  variant?: FeedbackMessageVariant;
}

export function FeedbackMessage({ children, variant = 'empty' }: FeedbackMessageProps) {
  return (
    <p
      className="text-sm text-content-secondary"
      role={variant === 'loading' ? 'status' : undefined}
    >
      {children}
    </p>
  );
}
