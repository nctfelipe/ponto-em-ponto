import type { ReactNode } from 'react';

interface PageCardProps {
  children: ReactNode;
  title: string;
  eyebrow?: ReactNode;
}

export function PageCard({ children, eyebrow, title }: PageCardProps) {
  return (
    <main className="grid min-h-svh place-items-center bg-background px-6 py-12">
      <section className="w-full max-w-md rounded-2xl bg-surface p-8 shadow-sm ring-1 ring-border">
        <header>
          {eyebrow && <div>{eyebrow}</div>}
          <h1 className="mt-2 text-2xl font-semibold text-content">{title}</h1>
        </header>
        {children}
      </section>
    </main>
  );
}
