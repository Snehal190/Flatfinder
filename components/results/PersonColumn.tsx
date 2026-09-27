"use client";

import { useState } from "react";
import { anchorTypeLabel, areaLabel, formatRupees } from "@/lib/data/catalog";
import type { OptionResult } from "@/lib/matching/types";

type Person = OptionResult["people"][number];

export function PersonColumn({ p, full = false }: { p: Person; full?: boolean }) {
  const [more, setMore] = useState(false);
  const showAll = full || more;
  const gets = showAll ? p.met : p.met.slice(0, 5);
  const hidden = p.met.length - gets.length;
  const score = Math.round(p.score);

  return (
    <div className="p-5">
      <p className="text-xl font-bold tracking-tight">{p.name}</p>
      <div className="mt-3">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-xs font-semibold leading-tight text-ink/70">How much of her wishlist this covers</p>
          <p className="text-2xl font-black tracking-tighter">{score}</p>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bg-2 ring-1 ring-ink/10" aria-hidden>
          <div className="h-full rounded-full bg-ink" style={{ width: `${score}%` }} />
        </div>
      </div>

      {p.violations.length > 0 && (
        <div className="mt-4 rounded-xl border-2 border-ink p-3">
          <p className="label-util">⚠ Breaks her must-have</p>
          <ul className="mt-1.5 space-y-1 text-sm">
            {p.violations.map((v) => <li key={v.rule}><strong>{v.label}</strong>: {v.detail}</li>)}
          </ul>
        </div>
      )}

      <p className="label-util mt-5">✓ Gets</p>
      {gets.length === 0 ? (
        <p className="mt-1.5 text-sm text-ink/70">Nothing extra from her wishlist</p>
      ) : (
        <ul className="mt-1.5 space-y-1 text-sm leading-snug">
          {gets.map((m) => <li key={m.rule} className="flex gap-2"><span aria-hidden>✓</span><span>{m.label}</span></li>)}
        </ul>
      )}
      {hidden > 0 && (
        <button type="button" onClick={() => setMore(true)} className="mt-1.5 text-xs font-bold underline decoration-accent decoration-2 underline-offset-4">
          +{hidden} more
        </button>
      )}

      <p className="label-util mt-5">⚠ Gives up</p>
      {p.missed.length === 0 ? (
        <p className="mt-1.5 text-sm text-ink/70">Nothing on her wishlist</p>
      ) : (
        <ul className="mt-1.5 space-y-1.5 text-sm leading-snug">
          {p.missed.map((m) => (
            <li key={m.rule} className="flex gap-2">
              <span aria-hidden>⚠</span>
              <span><span className="font-semibold">{m.label}</span>{full || m.rule.startsWith("anchor") || m.rule === "under_budget" ? <span className="text-ink/70">: {m.detail}</span> : null}</span>
            </li>
          ))}
        </ul>
      )}

      {p.commutes.length > 0 && (
        <>
          <p className="label-util mt-5">Commutes</p>
          <ul className="mt-1.5 space-y-1 text-sm">
            {p.commutes.map((c, i) => (
              <li key={i} className="flex items-baseline justify-between gap-2">
                <span>{anchorTypeLabel(c.anchor.type)} · {areaLabel(c.anchor.areaId)}</span>
                <span className="whitespace-nowrap font-semibold">
                  {c.minutes} min {c.withinLimit ? "✓" : `⚠ +${c.minutes - c.anchor.maxMinutes}`}
                  <span className="sr-only">{c.withinLimit ? " within her limit" : ` over her ${c.anchor.maxMinutes} minute limit`}</span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-5 border-t border-ink/10 pt-3 text-sm">
        {p.room && (
          <p>
            <span className="font-semibold">{p.room.name}</span>
            {(p.room.attachedBath || p.room.ac) && (
              <span className="text-ink/70"> · {[p.room.attachedBath && "attached bath", p.room.ac && "AC"].filter(Boolean).join(", ")}</span>
            )}
          </p>
        )}
        <p className="mt-1">
          <span className="font-semibold">{formatRupees(p.rentShare)}</span>
          <span className="text-ink/70">/mo · {p.rentShareVsMax}% of her max</span>
        </p>
      </div>
    </div>
  );
}
