"use client";

import { AreaChip, Chip, type AreaState } from "@/components/ui/Chip";
import { ThreeStateToggle } from "@/components/ui/ThreeStateToggle";
import { ANCHOR_TYPES, AREAS, COMMUTE_OPTIONS, anchorTypeLabel, type AreaId } from "@/lib/data/catalog";
import type { Anchor } from "@/lib/schema";
import { Question } from "./Question";
import { withKey } from "./ToggleRow";
import type { StepProps } from "./types";

const NEW_ANCHOR: Anchor = { type: "office", areaId: "shivajinagar", maxMinutes: 30, strictness: "nice" };

export function StepWhere({ answers, set }: StepProps) {
  const setArea = (id: AreaId, s: AreaState) =>
    set({ areas: withKey(answers.areas, id, s === "neutral" ? undefined : s) });
  const setAnchor = (i: number, patch: Partial<Anchor>) =>
    set({ anchors: answers.anchors.map((a, j) => (j === i ? { ...a, ...patch } : a)) });

  return (
    <div>
      <Question id="q-areas" title="Areas" helper="Tap once to prefer, twice for won't consider, three times to reset. Won't consider rules an area out completely.">
        <ul aria-label="Legend" className="mb-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink/70">
          <li className="flex items-center gap-2"><span aria-hidden className="h-4 w-4 rounded-full border border-ink/30" /> Neutral</li>
          <li className="flex items-center gap-2"><span aria-hidden className="h-4 w-4 rounded-full bg-accent" /> ♥ Prefer</li>
          <li className="flex items-center gap-2"><span aria-hidden className="h-4 w-4 rounded-full bg-ink" /> ✕ <span className="line-through">Won&apos;t consider</span></li>
        </ul>
        <div className="flex flex-wrap gap-2">
          {AREAS.map((a) => (
            <AreaChip key={a.id} label={a.label} state={answers.areas[a.id] ?? "neutral"} onChange={(s) => setArea(a.id, s)} />
          ))}
        </div>
      </Question>

      <Question id="q-anchors" title="Places I need to be near" helper="Up to three: office, gym, family, anything you travel to often. Times are typical weekday peak by car or scooter.">
        <div className="space-y-6">
          {answers.anchors.map((a, i) => (
            <fieldset key={i} className="rounded-2xl border border-ink/10 bg-bg-2 p-5 sm:p-6">
              <legend className="sr-only">Place {i + 1}</legend>
              <div className="mb-4 flex items-center justify-between">
                <p className="label-util">Place {i + 1} · {anchorTypeLabel(a.type)}</p>
                <button
                  type="button"
                  onClick={() => set({ anchors: answers.anchors.filter((_, j) => j !== i) })}
                  className="text-xs font-bold uppercase tracking-wider underline decoration-accent decoration-2 underline-offset-4 hover:decoration-ink"
                  aria-label={`Remove place ${i + 1}`}
                >
                  Remove
                </button>
              </div>

              <p className="mb-2 text-sm font-semibold">What is it?</p>
              <div role="group" aria-label={`Place ${i + 1} type`} className="mb-5 flex flex-wrap gap-2">
                {ANCHOR_TYPES.map((t) => (
                  <Chip key={t.id} selected={a.type === t.id} onClick={() => setAnchor(i, { type: t.id })}>{t.label}</Chip>
                ))}
              </div>

              <label className="mb-2 block text-sm font-semibold" htmlFor={`anchor-area-${i}`}>Where is it?</label>
              <select
                id={`anchor-area-${i}`}
                value={a.areaId}
                onChange={(e) => setAnchor(i, { areaId: e.target.value as AreaId })}
                className="mb-5 min-h-[44px] w-full rounded-full border border-ink/20 bg-bg px-4 text-base font-semibold"
              >
                {AREAS.map((ar) => <option key={ar.id} value={ar.id}>{ar.label}</option>)}
              </select>

              <p className="mb-2 text-sm font-semibold">Longest commute I&apos;ll accept</p>
              <div role="group" aria-label={`Place ${i + 1} maximum commute`} className="mb-5 flex flex-wrap gap-2">
                {COMMUTE_OPTIONS.map((m) => (
                  <Chip key={m} selected={a.maxMinutes === m} onClick={() => setAnchor(i, { maxMinutes: m })}>{m} min</Chip>
                ))}
              </div>

              <p className="mb-2 text-sm font-semibold">How strict?</p>
              <ThreeStateToggle
                label={`Place ${i + 1} strictness`}
                options={["must", "nice"]}
                value={a.strictness}
                onChange={(v) => setAnchor(i, { strictness: v === "must" ? "must" : "nice" })}
                className="w-full sm:w-[260px]"
              />
              <p className="mt-2 text-sm text-ink/70">
                {a.strictness === "must"
                  ? "Any flat further than this is out."
                  : "Further flats still count, but lose points the further they are."}
              </p>
            </fieldset>
          ))}
          {answers.anchors.length < 3 && (
            <button
              type="button"
              onClick={() => set({ anchors: [...answers.anchors, NEW_ANCHOR] })}
              className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/20 text-sm font-bold uppercase tracking-wider transition-colors duration-300 ease-house hover:border-ink"
            >
              <span aria-hidden>+</span> {answers.anchors.length === 0 ? "Add a place" : "Add another place"}
            </button>
          )}
        </div>
      </Question>
    </div>
  );
}
