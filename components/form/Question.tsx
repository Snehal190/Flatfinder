import type { ReactNode } from "react";

export function Question({ title, helper, children, id }: { title: string; helper: string; children: ReactNode; id?: string }) {
  return (
    <section aria-labelledby={id} className="border-t border-ink/10 py-10 first:border-t-0 first:pt-0">
      <h2 id={id} className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{title}</h2>
      <p className="mb-6 mt-2 text-base leading-relaxed text-ink/70">{helper}</p>
      {children}
    </section>
  );
}
