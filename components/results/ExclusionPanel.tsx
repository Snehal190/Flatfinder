import { areaLabel } from "@/lib/data/catalog";
import type { CloseCall, ExclusionCategory } from "@/lib/matching/types";

export function ExclusionPanel({ exclusions, closeCalls, excludedCount, shownIds }: {
  exclusions: ExclusionCategory[];
  closeCalls: CloseCall[];
  excludedCount: number;
  shownIds: string[];
}) {
  const calls = closeCalls.filter((c) => !shownIds.includes(c.listing.id));
  return (
    <details className="group rounded-3xl border border-ink/10 bg-bg-2">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 sm:p-8 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="label-util block">The rest of the list</span>
          <span className="mt-2 block text-3xl font-bold tracking-tight sm:text-4xl">Why not the other {excludedCount} flats?</span>
        </span>
        <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink text-2xl text-bg transition-transform duration-300 ease-house group-open:rotate-45">+</span>
      </summary>
      <div className="space-y-10 px-6 pb-8 sm:px-8">
        <p className="max-w-2xl leading-relaxed text-ink/70">
          Each flat below breaks at least one person&apos;s must-have. A flat can appear under more than one reason.
        </p>
        <ul className="divide-y divide-ink/10 border-y border-ink/10">
          {exclusions.map((c) => (
            <li key={c.key}>
              <details>
                <summary className="flex cursor-pointer list-none items-center gap-4 py-4 [&::-webkit-details-marker]:hidden">
                  <span className="w-12 shrink-0 text-3xl font-black tracking-tighter">{c.count}</span>
                  <span className="font-semibold leading-snug">{c.label}</span>
                </summary>
                <ul className="pb-4 pl-16 text-sm text-ink/70">
                  {c.listings.map((l) => <li key={l.id}>{l.title}</li>)}
                </ul>
              </details>
            </li>
          ))}
        </ul>
        {calls.length > 0 && (
          <div>
            <p className="label-util">Close calls: one must-have away</p>
            <ul className="mt-3 space-y-3">
              {calls.map((c) => (
                <li key={c.listing.id} className="rounded-2xl border border-ink/15 bg-bg p-4">
                  <p className="font-semibold">{c.listing.title} <span className="font-normal text-ink/70">· {areaLabel(c.listing.areaId)}</span></p>
                  <p className="mt-1 text-sm">
                    ⚠ {c.violation.personName}&apos;s {c.violation.label.charAt(0).toLowerCase() + c.violation.label.slice(1)} → {c.violation.detail}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </details>
  );
}
