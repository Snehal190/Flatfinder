"use client";

import type { ReactNode } from "react";

interface ChipProps {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
}

/** Single-select or toggle chip. Exposes state via aria-pressed. */
export function Chip({ selected, onClick, children, ariaLabel, className = "" }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={ariaLabel}
      onClick={onClick}
      className={`min-h-[40px] rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 ease-house ${
        selected ? "border-ink bg-ink text-bg" : "border-ink/20 bg-transparent text-ink hover:border-ink"
      } ${className}`}
    >
      {selected && <span aria-hidden className="mr-1.5">✓</span>}
      {children}
    </button>
  );
}

export type AreaState = "neutral" | "prefer" | "exclude";

const NEXT: Record<AreaState, AreaState> = { neutral: "prefer", prefer: "exclude", exclude: "neutral" };
const STATE_TEXT: Record<AreaState, string> = { neutral: "neutral", prefer: "preferred", exclude: "won't consider" };

/** Area chip cycling Neutral → Prefer → Won't consider. */
export function AreaChip({ label, state, onChange }: { label: string; state: AreaState; onChange: (s: AreaState) => void }) {
  const styles: Record<AreaState, string> = {
    neutral: "border-ink/20 bg-transparent text-ink hover:border-ink",
    prefer: "border-accent bg-accent text-ink",
    exclude: "border-ink bg-ink text-bg",
  };
  return (
    <button
      type="button"
      onClick={() => onChange(NEXT[state])}
      aria-label={`${label}: ${STATE_TEXT[state]}. Tap to change.`}
      className={`min-h-[40px] rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 ease-house ${styles[state]}`}
    >
      {state === "prefer" && <span aria-hidden className="mr-1.5">♥</span>}
      {state === "exclude" && <span aria-hidden className="mr-1.5">✕</span>}
      <span className={state === "exclude" ? "line-through decoration-2" : ""}>{label}</span>
    </button>
  );
}
