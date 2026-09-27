import type { PersonStatus } from "@/lib/group-view";

/** Shows only who has submitted. Never what anyone chose. */
export function StatusStrip({ people, meIndex }: { people: PersonStatus[]; meIndex: number }) {
  return (
    <div className="glass sticky top-20 z-40">
      <p className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-3 text-sm font-semibold" aria-live="polite">
        {people.map((p, i) => (
          <span key={p.position} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden className="text-ink/30">·</span>}
            <span>
              {p.name}
              {p.position === meIndex && <span className="font-normal text-ink/70"> (you)</span>}{" "}
              <span aria-hidden>{p.submitted ? "✓" : "⏳"}</span>
              <span className="sr-only">{p.submitted ? "submitted" : "not submitted yet"}</span>
            </span>
          </span>
        ))}
      </p>
    </div>
  );
}
