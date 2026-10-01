import type { ReactNode } from 'react';

interface PageContentProps {
  children: ReactNode;
  width?: 'full' | 'narrow';
  title: string;
}

const widthClasses: Record<NonNullable<PageContentProps['width']>, string> = {
  full: 'w-full',
  narrow: 'mx-auto w-full max-w-xl',
};

export function PageContent({ children, title, width = 'full' }: PageContentProps) {
  return (
    <section className={`space-y-4 ${widthClasses[width]}`}>
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      {children}
    </section>
  );
}
