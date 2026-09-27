import Link from "next/link";
import type { CheckedFlatView } from "@/lib/group-view";

const ICON = { fits: "✓", near: "⚠", no: "✕" } as const;

/** Entry point from the results page to the "found a flat online?" checker. */
export function CheckFlatCta({ groupId, checks }: { groupId: string; checks: CheckedFlatView[] }) {
  return (
    <section className="rounded-3xl bg-accent p-6 sm:p-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <p className="label-util">New</p>
          <h2 className="mt-3 text-3xl font-black leading-[0.95] tracking-tighter sm:text-5xl">Found a flat online?</h2>
          <p className="mt-3 text-lg leading-relaxed">
            Paste the link from 99acres, Housing.com, MagicBricks or NoBroker and see straight away if it works for all three of you.
          </p>
        </div>
        <Link href={`/g/${groupId}/check`} className="inline-flex min-h-[52px] shrink-0 items-center justify-center rounded-full bg-ink px-8 text-xs font-bold uppercase tracking-wider text-bg transition-transform duration-300 ease-house hover:-translate-y-0.5">
          Check a flat →
        </Link>
      </div>
      {checks.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2 border-t border-ink/15 pt-5" aria-label="Flats you've checked">
          {checks.slice(0, 4).map((c) => (
            <li key={c.id}>
              <Link href={`/g/${groupId}/check`} className="inline-flex items-center gap-2 rounded-full bg-bg px-4 py-2 text-sm font-semibold">
                <span aria-hidden>{ICON[c.result.verdict]}</span>
                {c.title}
                <span className="sr-only">: {c.result.verdict === "fits" ? "works for everyone" : "breaks a dealbreaker"}</span>
              </Link>
            </li>
          ))}
          {checks.length > 4 && <li className="self-center text-sm font-semibold">+{checks.length - 4} more</li>}
        </ul>
      )}
    </section>
  );
}
