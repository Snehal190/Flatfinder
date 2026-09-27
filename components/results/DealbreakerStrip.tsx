export function DealbreakerStrip({ mustHaves }: { mustHaves: { name: string; items: string[] }[] }) {
  return (
    <section aria-labelledby="ground-rules" className="rounded-2xl border-2 border-ink bg-bg">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink/15 px-5 py-4 sm:px-7">
        <h2 id="ground-rules" className="label-util">⚠ Everyone&apos;s dealbreakers</h2>
        <p className="text-sm text-ink/70">Every option below passes all of these, unless it&apos;s clearly flagged.</p>
      </div>
      <div className="grid md:grid-cols-3">
        {mustHaves.map((m, i) => (
          <div key={m.name} className={`px-5 py-5 sm:px-7 ${i > 0 ? "border-t border-ink/15 md:border-l md:border-t-0" : ""}`}>
            <p className="text-xl font-bold tracking-tight">{m.name}</p>
            <ul className="mt-3 space-y-1.5 text-sm leading-snug">
              {m.items.map((it) => (
                <li key={it} className="flex gap-2"><span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ink" />{it}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
