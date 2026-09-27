"use client";

import { useId } from "react";

interface Props {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  label: string;
  format: (v: number) => string;
}

export function Slider({ min, max, step, value, onChange, label, format }: Props) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <label htmlFor={id} className="sr-only">{label}</label>
      <p aria-hidden className="mb-4 text-6xl font-black tracking-tighter sm:text-7xl">{format(value)}</p>
      <div className="relative h-11">
        <div aria-hidden className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 overflow-hidden rounded-full bg-bg-2 ring-1 ring-ink/10">
          <div className="h-full rounded-full bg-accent transition-[width] duration-300 ease-house" style={{ width: `${pct}%` }} />
        </div>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-valuetext={format(value)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="range-input absolute inset-0"
        />
      </div>
      <div aria-hidden className="mt-1 flex justify-between text-xs font-semibold text-ink/70">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}
