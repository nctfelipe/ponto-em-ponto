import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'border border-slate-300 text-slate-700 hover:bg-slate-50',
};

const sizeClasses: Record<ButtonSize, string> = {
  small: 'px-3 py-2 text-sm',
  medium: 'px-4 py-3 text-sm',
  large: 'px-6 py-5 text-base',
};

export function Button({
  className = '',
  size = 'medium',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
