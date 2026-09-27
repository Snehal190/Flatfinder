"use client";

import { useState } from "react";
import { BalanceMeter } from "@/components/results/BalanceMeter";
import { PersonColumn } from "@/components/results/PersonColumn";
import { CopyButton } from "@/components/ui/CopyButton";
import { FURNISHING_LABEL, areaLabel, formatRupees, formatRupeesShort } from "@/lib/data/catalog";
import type { CheckedFlatView } from "@/lib/group-view";

const VERDICT = {
  fits: { icon: "✓", title: "Works with everyone's dealbreakers", box: "bg-ink text-bg" },
  near: { icon: "⚠", title: "Breaks 1 dealbreaker", box: "bg-accent text-ink" },
  no: { icon: "✕", title: "Breaks several dealbreakers", box: "border-2 border-ink bg-bg text-ink" },
} as const;

function summary(c: CheckedFlatView): string {
  const r = c.result;
  const lines = [
    `*${c.title}*${c.url ? `\n${c.url}` : ""}`,
    `${VERDICT[r.verdict].icon} ${VERDICT[r.verdict].title}`,
    `Rent ${formatRupees(c.facts.rentMonthly)} → ${formatRupees(c.facts.rentMonthly / 3)} each`,
  ];
  for (const v of r.violations) lines.push(`⚠ ${v.personName}: ${v.label} (${v.detail})`);
  lines.push("", `_${r.tradeoff}_`);
  for (const p of r.people) lines.push(`${p.name}: ${Math.round(p.score)}% of her wishlist`);
  return lines.join("\n");
}

export function FlatCheckCard({ check, onDelete, defaultOpen = false }: { check: CheckedFlatView; onDelete?: () => void; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const r = check.result;
  const v = VERDICT[r.verdict];
  const f = check.facts;
  const facts = [
    areaLabel(f.areaId),
    `${formatRupees(f.rentMonthly)}/mo`,
    `${formatRupees(f.rentMonthly / 3)} each`,
    `Deposit ${formatRupeesShort(f.deposit)}`,
    `${f.bhk}BHK · ${f.bathrooms} bath`,
    `${f.floor === 0 ? "Ground" : `Floor ${f.floor}`} of ${f.totalFloors} · lift ${f.hasLift ? "✓" : "✗"}`,
    FURNISHING_LABEL[f.furnishing],
  ];

  return (
    <article className="overflow-hidden rounded-3xl bg-bg-2/60 ring-1 ring-ink/10">
      <div className={`flex items-center gap-3 px-5 py-3 sm:px-6 ${v.box}`}>
        <span aria-hidden className="text-xl font-black">{v.icon}</span>
        <p className="text-sm font-bold uppercase tracking-wider">{v.title}</p>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="text-2xl font-bold leading-tight tracking-tight">{check.title}</h3>
          {check.url && (
            <a href={check.url} target="_blank" rel="noopener noreferrer nofollow" className="shrink-0 text-sm font-semibold underline decoration-accent decoration-2 underline-offset-4">
              Open listing ↗
            </a>
          )}
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-[10px] font-black uppercase tracking-[0.2em]" aria-label="Key facts">
          {facts.map((x, i) => (
            <li key={x} className="flex items-center gap-2">{i > 0 && <span aria-hidden className="text-accent">•</span>}{x}</li>
          ))}
        </ul>

        {r.violations.length > 0 && (
          <ul className="mt-5 space-y-2">
            {r.violations.map((x) => (
              <li key={`${x.personIndex}-${x.rule}`} className="rounded-2xl border-2 border-ink bg-bg p-3 font-semibold leading-snug">
                ⚠ {x.personName}&apos;s {x.label.charAt(0).toLowerCase() + x.label.slice(1)} → {x.detail}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 border-l-4 border-accent pl-4">
          <p className="label-util">{r.tag}</p>
          <p className="mt-2 text-lg font-bold leading-snug tracking-tight">{r.tradeoff}</p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          {r.people.map((p) => (
            <div key={p.name} className="rounded-2xl bg-bg p-3 ring-1 ring-ink/10">
              <p className="text-sm font-bold">{p.name}</p>
              <p className="mt-1 text-2xl font-black tracking-tighter">{p.violations.length ? "⚠" : `${Math.round(p.score)}`}</p>
              <p className="text-[11px] leading-tight text-ink/70">{p.violations.length ? "breaks her must-have" : "% of her wishlist"}</p>
            </div>
          ))}
        </div>

        {open && (
          <>
            <div className="mt-6 grid overflow-hidden rounded-2xl border border-ink/10 bg-bg md:grid-cols-3">
              {r.people.map((p, i) => (
                <div key={p.name} className={i > 0 ? "border-t border-ink/10 md:border-l md:border-t-0" : ""}>
                  <PersonColumn p={p} />
                </div>
              ))}
            </div>
            <div className="mt-6">
              <BalanceMeter scores={r.people.map((p) => p.score)} names={r.people.map((p) => p.name)} label={r.balance} />
            </div>
          </>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="inline-flex min-h-[40px] items-center rounded-full bg-ink px-4 text-[11px] font-bold uppercase tracking-wider text-bg"
          >
            {open ? "Hide details" : "What each person gets"}
          </button>
          <CopyButton text={summary(check)} label="Copy for WhatsApp" />
          {onDelete && (
            <button type="button" onClick={onDelete} className="inline-flex min-h-[40px] items-center rounded-full px-4 text-[11px] font-bold uppercase tracking-wider text-ink/70 underline underline-offset-4 hover:text-ink">
              Remove
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
