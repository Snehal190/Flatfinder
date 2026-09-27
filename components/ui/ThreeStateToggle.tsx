"use client";

import { useRef, type KeyboardEvent } from "react";

export type ToggleValue = "must" | "nice" | "dontcare";

const META: Record<ToggleValue, { label: string; on: string; text: string }> = {
  must: { label: "Must have", on: "bg-ink", text: "text-bg" },
  nice: { label: "Nice to have", on: "bg-accent", text: "text-ink" },
  dontcare: { label: "Don't care", on: "bg-transparent", text: "text-ink/70" },
};

interface Props {
  value: ToggleValue;
  onChange: (v: ToggleValue) => void;
  /** Accessible name, e.g. the question label. */
  label: string;
  options?: ToggleValue[];
  className?: string;
}

/**
 * Segmented pill with a sliding indicator. Implemented as a radio group:
 * arrow keys move between states, Tab moves in/out.
 */
export function ThreeStateToggle({ value, onChange, label, options = ["must", "nice", "dontcare"], className = "" }: Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const idx = Math.max(0, options.indexOf(value));

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (i + delta + options.length) % options.length;
    onChange(options[next]);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`relative grid rounded-full border border-ink/10 bg-bg-2 p-1 ${className}`}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden
        className={`absolute bottom-1 left-1 top-1 rounded-full transition-all duration-300 ease-house ${META[value].on} ${value === "dontcare" ? "border border-dashed border-ink/25" : ""}`}
        style={{
          width: `calc((100% - 8px) / ${options.length})`,
          transform: `translateX(${idx * 100}%)`,
        }}
      />
      {options.map((opt, i) => {
        const checked = opt === value;
        return (
          <button
            key={opt}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(opt)}
            onKeyDown={(e) => onKey(e, i)}
            className={`relative z-10 min-h-[40px] whitespace-nowrap rounded-full px-2 text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 ease-house sm:px-4 ${
              checked ? META[opt].text : "text-ink/70 hover:text-ink"
            }`}
          >
            {checked && opt === "must" && <span aria-hidden className="mr-1">●</span>}
            {META[opt].label}
          </button>
        );
      })}
    </div>
  );
}
