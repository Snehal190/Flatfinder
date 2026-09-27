"use client";

import {
  amenityLabel, anchorTypeLabel, areaLabel, formatRupees, lifestyleLabel,
  type AmenityId, type AreaId, type LifestyleId,
} from "@/lib/data/catalog";
import type { PersonAnswers, Strictness } from "@/lib/schema";

interface Item {
  text: string;
  step: number;
}

function split(a: PersonAnswers) {
  const must: Item[] = [];
  const nice: Item[] = [];
  const areas = Object.entries(a.areas) as [AreaId, "prefer" | "exclude"][];
  const excluded = areas.filter(([, v]) => v === "exclude").map(([k]) => areaLabel(k));
  const preferred = areas.filter(([, v]) => v === "prefer").map(([k]) => areaLabel(k));
  if (excluded.length) must.push({ text: `Won't consider: ${excluded.join(", ")}`, step: 1 });
  if (preferred.length) nice.push({ text: `Prefer: ${preferred.join(", ")}`, step: 1 });
  for (const anc of a.anchors) {
    const t = `${anchorTypeLabel(anc.type)} in ${areaLabel(anc.areaId)} within ${anc.maxMinutes} min`;
    (anc.strictness === "must" ? must : nice).push({ text: t, step: 1 });
  }
  if (a.floorRule === "low_only") must.push({ text: "Ground / low floor only (0–2)", step: 2 });
  if (a.floorRule === "lift_or_low") must.push({ text: "Any floor, but only with a lift", step: 2 });
  for (const [id, s] of Object.entries(a.amenities) as [AmenityId, Strictness][]) {
    (s === "must" ? must : nice).push({ text: amenityLabel(id), step: 2 });
  }
  if (a.minBathrooms) {
    (a.minBathrooms.strictness === "must" ? must : nice).push({ text: `At least ${a.minBathrooms.value} bathrooms`, step: 2 });
  }
  for (const [id, s] of Object.entries(a.lifestyle) as [LifestyleId, Strictness][]) {
    (s === "must" ? must : nice).push({ text: lifestyleLabel(id), step: 3 });
  }
  if (a.preferUnderBudget) nice.push({ text: "Stay well under my max budget", step: 0 });
  return { must, nice };
}

function EditLink({ step, onEdit, what }: { step: number; onEdit: (s: number) => void; what: string }) {
  return (
    <button
      type="button"
      onClick={() => onEdit(step)}
      aria-label={`Edit ${what}`}
      className="shrink-0 text-[11px] font-bold uppercase tracking-wider underline decoration-accent decoration-2 underline-offset-4 hover:decoration-ink"
    >
      Edit
    </button>
  );
}

export function StepReview({ answers, onEdit }: { answers: PersonAnswers; onEdit: (step: number) => void }) {
  const { must, nice } = split(answers);
  return (
    <div className="space-y-10">
      <section aria-labelledby="rev-must" className="rounded-2xl border-2 border-ink bg-bg p-5 sm:p-7">
        <p className="label-util mb-2">⚠ Dealbreakers</p>
        <h2 id="rev-must" className="text-2xl font-bold tracking-tight sm:text-3xl">Must haves</h2>
        <p className="mt-2 border-l-4 border-accent pl-3 text-base leading-relaxed">
          Each of these will rule a flat out completely. Keep only the ones you truly can&apos;t live without.
        </p>
        {must.length === 0 ? (
          <p className="mt-5 text-ink/70">No extra dealbreakers beyond your budget. That keeps lots of options open.</p>
        ) : (
          <ul className="mt-5 divide-y divide-ink/10">
            {must.map((m) => (
              <li key={m.text} className="flex items-center justify-between gap-4 py-3">
                <span className="flex items-start gap-3 font-semibold"><span aria-hidden className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-ink" />{m.text}</span>
                <EditLink step={m.step} onEdit={onEdit} what={m.text} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="rev-budget">
        <div className="flex items-center justify-between">
          <h2 id="rev-budget" className="text-2xl font-bold tracking-tight">Budget</h2>
          <EditLink step={0} onEdit={onEdit} what="budget" />
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-bg-2 p-5">
            <dt className="label-util">Rent, my share</dt>
            <dd className="mt-2 text-3xl font-black tracking-tighter">≤ {formatRupees(answers.maxRent)}</dd>
          </div>
          <div className="rounded-2xl bg-bg-2 p-5">
            <dt className="label-util">Deposit, my share</dt>
            <dd className="mt-2 text-3xl font-black tracking-tighter">{answers.maxDeposit === null ? "No limit" : `≤ ${formatRupees(answers.maxDeposit)}`}</dd>
          </div>
        </dl>
        <p className="mt-3 text-sm text-ink/70">Your budget always counts as a dealbreaker.</p>
      </section>

      <section aria-labelledby="rev-anchors">
        <div className="flex items-center justify-between">
          <h2 id="rev-anchors" className="text-2xl font-bold tracking-tight">Places I need to be near</h2>
          <EditLink step={1} onEdit={onEdit} what="places" />
        </div>
        {answers.anchors.length === 0 ? (
          <p className="mt-3 text-ink/70">None added.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {answers.anchors.map((a, i) => (
              <li key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-semibold">{anchorTypeLabel(a.type)} · {areaLabel(a.areaId)}</span>
                <span className="text-ink/70">≤ {a.maxMinutes} min</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${a.strictness === "must" ? "bg-ink text-bg" : "bg-accent text-ink"}`}>
                  {a.strictness === "must" ? "Must" : "Nice"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="rev-nice">
        <h2 id="rev-nice" className="text-2xl font-bold tracking-tight">Nice to haves</h2>
        {nice.length === 0 ? (
          <p className="mt-3 text-ink/70">Nothing marked. Every flat that passes your dealbreakers will score the same for you.</p>
        ) : (
          <ul className="mt-3 divide-y divide-ink/10">
            {nice.map((n) => (
              <li key={n.text} className="flex items-center justify-between gap-4 py-3">
                <span className="flex items-start gap-3"><span aria-hidden className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />{n.text}</span>
                <EditLink step={n.step} onEdit={onEdit} what={n.text} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
