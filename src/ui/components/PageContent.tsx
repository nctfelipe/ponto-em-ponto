import type { ReactNode } from 'react';

interface PageContentProps {
  children: ReactNode;
  title: string;
}

export function PageContent({ children, title }: PageContentProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      {children}
    </section>
  );
}
