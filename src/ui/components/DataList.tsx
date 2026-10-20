import type { HTMLAttributes, LiHTMLAttributes, ReactNode } from 'react';

interface DataListProps {
  children: ReactNode;
}

interface DataListHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

interface DataListRowProps extends LiHTMLAttributes<HTMLLIElement> {
  children: ReactNode;
}

export function DataList({ children }: DataListProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface text-sm">
      {children}
    </div>
  );
}

export function DataListHeader({ children, className = '', ...props }: DataListHeaderProps) {
  return (
    <div
      className={`hidden gap-4 bg-background px-4 py-3 font-semibold text-content-secondary md:grid ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function DataListBody({ children }: DataListProps) {
  return <ol className="divide-y divide-border">{children}</ol>;
}

export function DataListRow({ children, className = '', ...props }: DataListRowProps) {
  return (
    <li className={`grid gap-3 px-4 py-3 md:items-center md:gap-4 ${className}`} {...props}>
      {children}
    </li>
  );
}
