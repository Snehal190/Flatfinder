"use client";

import { ThreeStateToggle, type ToggleValue } from "@/components/ui/ThreeStateToggle";
import type { Strictness } from "@/lib/schema";

interface Props {
  label: string;
  helper: string;
  value: Strictness | undefined;
  onChange: (v: Strictness | undefined) => void;
}

/** A labelled three-state row: Must / Nice / Don't care (absent). */
export function ToggleRow({ label, helper, value, onChange }: Props) {
  const v: ToggleValue = value ?? "dontcare";
  return (
    <div className="flex flex-col gap-3 border-b border-ink/10 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <p className="text-lg font-semibold leading-snug">{label}</p>
        <p className="text-sm leading-relaxed text-ink/70">{helper}</p>
      </div>
      <ThreeStateToggle
        label={label}
        value={v}
        onChange={(nv) => onChange(nv === "dontcare" ? undefined : nv)}
        className="w-full shrink-0 sm:w-[360px]"
      />
    </div>
  );
}

/** Helper to set/unset a key in a Partial<Record> immutably. */
export function withKey<K extends string, V>(rec: Partial<Record<K, V>>, key: K, value: V | undefined): Partial<Record<K, V>> {
  const next = { ...rec };
  if (value === undefined) delete next[key];
  else next[key] = value;
  return next;
}
