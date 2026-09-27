import Link from "next/link";
import { RevealUp } from "@/components/ui/RevealUp";
import type { GroupView } from "@/lib/group-view";
import { DealbreakerStrip } from "./DealbreakerStrip";
import { ExclusionPanel } from "./ExclusionPanel";
import { OptionCard } from "./OptionCard";

type Unlocked = NonNullable<GroupView["unlocked"]>;

function EmptyState({ unlocked }: { unlocked: Unlocked }) {
  const top = unlocked.results.exclusions.slice(0, 3);
  return (
    <section className="rounded-3xl border-2 border-ink p-6 sm:p-10">
      <p className="label-util">No options yet</p>
      <h2 className="mt-3 text-4xl font-black leading-[0.9] tracking-tighter sm:text-5xl">Nothing passes everyone&apos;s dealbreakers, not even close.</h2>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink/70">
        That&apos;s useful to know before anyone falls for a flat. These rules ruled out the most listings. They&apos;re the ones worth talking about:
      </p>
      <ol className="mt-6 space-y-3">
        {top.map((c, i) => (
          <li key={c.key} className="flex items-baseline gap-4">
            <span className="text-3xl font-black italic tracking-tighter">{i + 1}</span>
            <span className="text-lg"><strong>{c.label}</strong> <span className="text-ink/70">rules out {c.count} flats (set by {c.personName})</span></span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ResultsView({ view, unlocked }: { view: GroupView; unlocked: Unlocked }) {
  const { results } = unlocked;
  const names = view.people.map((p) => p.name);
  const updated = new Date(unlocked.updatedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  const nearMisses = results.options.some((o) => o.kind === "near_miss");

  return (
    <main className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-8 sm:pt-16">
      <RevealUp>
        <p className="label-util">{view.name ?? `${names.join(", ")}`} · Updated {updated}</p>
        <h1 className="mt-5 text-6xl font-black leading-[0.8] tracking-tighter sm:text-8xl lg:text-9xl">
          {results.options.length === 0 ? "Let's talk." : <>Three ways to <span className="italic text-accent">meet</span> in the middle.</>}
        </h1>
        <p className="mt-6 max-w-3xl text-xl leading-relaxed text-ink/70 sm:text-2xl">
          {results.eligibleCount >= 3
            ? "Three flats that pass everyone's dealbreakers. None of them is 'the one'. Each asks someone to give a little. Pick the tradeoff you're happiest with."
            : results.eligibleCount > 0
              ? `Only ${results.eligibleCount} flat${results.eligibleCount > 1 ? "s pass" : " passes"} everyone's dealbreakers. The rest are clearly flagged near-misses. None of them is 'the one'. Pick the tradeoff you're happiest with.`
              : "No flat passes every dealbreaker, so the options below are clearly flagged near-misses."}
        </p>
        <p className="mt-4 text-sm font-semibold">For {names.join(" · ")}</p>
      </RevealUp>

      <RevealUp className="mt-12">
        <DealbreakerStrip mustHaves={results.mustHaves} />
      </RevealUp>

      <section aria-label="Options" className="mt-16">
        {results.options.length === 0 ? (
          <EmptyState unlocked={unlocked} />
        ) : (
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-16">
            {results.options.map((o, i) => (
              <RevealUp key={o.listing.id} className={i % 2 === 1 ? "lg:mt-[100px]" : ""} delay={i * 80}>
                <OptionCard option={o} />
              </RevealUp>
            ))}
          </div>
        )}
        {nearMisses && (
          <p className="mt-8 text-sm text-ink/70">⚠ Cards marked “Breaks a must-have” are near-misses, never mixed silently with the flats that pass.</p>
        )}
      </section>

      <RevealUp className="mt-20">
        <ExclusionPanel
          exclusions={results.exclusions}
          closeCalls={results.closeCalls}
          excludedCount={results.excludedCount}
          shownIds={results.options.map((o) => o.listing.id)}
        />
      </RevealUp>

      <section aria-labelledby="edit-heading" className="mt-20 border-t border-ink/10 pt-10">
        <h2 id="edit-heading" className="label-util">Change my answers</h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-ink/70">
          Talked it through and changed your mind about a must-have? Update your own form and these options recompute automatically.
        </p>
        <ul className="mt-5 flex flex-wrap gap-3">
          {unlocked.editLinks.map((e) => (
            <li key={e.href}>
              <Link href={e.href} className="inline-flex min-h-[44px] items-center rounded-full border border-ink/20 px-5 text-sm font-bold transition-colors duration-300 ease-house hover:border-ink">
                I&apos;m {e.name}: change my answers →
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
