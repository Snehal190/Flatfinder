"use client";

import { Chip } from "@/components/ui/Chip";
import { Slider } from "@/components/ui/Slider";
import { ThreeStateToggle } from "@/components/ui/ThreeStateToggle";
import { DEPOSIT_OPTIONS, formatRupees } from "@/lib/data/catalog";
import { Question } from "./Question";
import type { StepProps } from "./types";

export function StepMoney({ answers, set }: StepProps) {
  return (
    <div>
      <Question id="q-rent" title="Max rent I can put in each month" helper="Your share only. We split rent three ways, and anything above this rules a flat out.">
        <Slider
          label="Maximum monthly rent contribution"
          min={8000}
          max={35000}
          step={500}
          value={answers.maxRent}
          onChange={(maxRent) => set({ maxRent })}
          format={formatRupees}
        />
        <p className="mt-4 text-sm text-ink/70">
          That means flats up to <strong className="text-ink">{formatRupees(answers.maxRent * 3)}</strong> a month in total, if the others can match it.
        </p>
      </Question>

      <Question id="q-deposit" title="Max security deposit I can put in" helper="Your third of the deposit. Pune owners often ask for 3–6 months' rent.">
        <div role="group" aria-labelledby="q-deposit" className="flex flex-wrap gap-2">
          {DEPOSIT_OPTIONS.map((o) => (
            <Chip key={o.label} selected={answers.maxDeposit === o.value} onClick={() => set({ maxDeposit: o.value })}>
              {o.label}
            </Chip>
          ))}
        </div>
      </Question>

      <Question id="q-comfort" title="I'd prefer to stay well under my max" helper="Flats where your share is 85% of your max or less get a boost for you. It never rules anything out.">
        <ThreeStateToggle
          label="Prefer to stay well under my max"
          options={["nice", "dontcare"]}
          value={answers.preferUnderBudget ? "nice" : "dontcare"}
          onChange={(v) => set({ preferUnderBudget: v === "nice" })}
          className="w-full sm:w-[260px]"
        />
      </Question>
    </div>
  );
}
