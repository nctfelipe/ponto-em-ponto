import type { ReactNode } from 'react';

interface PageCardProps {
  children: ReactNode;
  title: string;
  eyebrow?: string;
}

export function PageCard({ children, eyebrow, title }: PageCardProps) {
  return (
    <main className="grid min-h-svh place-items-center bg-slate-50 px-6 py-12">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <header>
          {eyebrow && <p className="text-sm font-semibold text-blue-600">{eyebrow}</p>}
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h1>
        </header>
        {children}
      </section>
    </main>
  );
}
