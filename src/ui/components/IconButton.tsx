import type { ButtonHTMLAttributes } from 'react';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  'aria-label': string;
};

export function IconButton({ className = '', ...props }: IconButtonProps) {
  return (
    <button
      className={`grid size-10 place-items-center rounded-lg text-content transition hover:bg-surface/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content ${className}`}
      {...props}
    />
  );
}
