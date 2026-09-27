"use client";

import { Chip } from "@/components/ui/Chip";
import { ThreeStateToggle } from "@/components/ui/ThreeStateToggle";
import { AMENITIES, FLOOR_RULES } from "@/lib/data/catalog";
import { Question } from "./Question";
import { ToggleRow, withKey } from "./ToggleRow";
import type { StepProps } from "./types";

export function StepFlat({ answers, set }: StepProps) {
  const bath = answers.minBathrooms;
  return (
    <div>
      <Question id="q-amenities" title="The flat itself" helper="Must have rules a flat out. Nice to have adds to your score. Don't care is ignored.">
        <div className="border-t border-ink/10">
          {AMENITIES.map((a) => (
            <ToggleRow
              key={a.id}
              label={a.label}
              helper={a.helper}
              value={answers.amenities[a.id]}
              onChange={(v) => set({ amenities: withKey(answers.amenities, a.id, v) })}
            />
          ))}
        </div>
      </Question>

      <Question id="q-baths" title="Minimum bathrooms for the flat" helper="Pick a number, then say how much it matters.">
        <div role="group" aria-labelledby="q-baths" className="mb-4 flex flex-wrap gap-2">
          <Chip selected={bath?.value === 2} onClick={() => set({ minBathrooms: { value: 2, strictness: bath?.strictness ?? "nice" } })}>2</Chip>
          <Chip selected={bath?.value === 3} onClick={() => set({ minBathrooms: { value: 3, strictness: bath?.strictness ?? "nice" } })}>3 (one each)</Chip>
        </div>
        <ThreeStateToggle
          label="Minimum bathrooms importance"
          value={bath ? bath.strictness : "dontcare"}
          onChange={(v) => set({ minBathrooms: v === "dontcare" ? null : { value: bath?.value ?? 2, strictness: v } })}
          className="w-full sm:w-[360px]"
        />
      </Question>

      <Question id="q-floor" title="Floor preference" helper="The first two options are dealbreakers: flats that don't fit are out.">
        <div role="radiogroup" aria-labelledby="q-floor" className="flex flex-wrap gap-2">
          {FLOOR_RULES.map((f) => (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={answers.floorRule === f.id}
              onClick={() => set({ floorRule: f.id })}
              className={`min-h-[40px] rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 ease-house ${
                answers.floorRule === f.id ? "border-ink bg-ink text-bg" : "border-ink/20 hover:border-ink"
              }`}
            >
              {answers.floorRule === f.id && <span aria-hidden className="mr-1.5">✓</span>}
              {f.label}
              {f.id !== "any" && <span className="ml-2 text-[10px] font-black uppercase tracking-wider opacity-80">· Must</span>}
            </button>
          ))}
        </div>
      </Question>
    </div>
  );
}
