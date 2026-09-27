"use client";

import { LIFESTYLE } from "@/lib/data/catalog";
import { Question } from "./Question";
import { ToggleRow, withKey } from "./ToggleRow";
import type { StepProps } from "./types";

export function StepLifestyle({ answers, set }: StepProps) {
  return (
    <Question id="q-life" title="Lifestyle & house rules" helper="The things owners and societies are strict about. Better to know before you visit.">
      <div className="border-t border-ink/10">
        {LIFESTYLE.map((l) => (
          <ToggleRow
            key={l.id}
            label={l.label}
            helper={l.helper}
            value={answers.lifestyle[l.id]}
            onChange={(v) => set({ lifestyle: withKey(answers.lifestyle, l.id, v) })}
          />
        ))}
      </div>
    </Question>
  );
}
