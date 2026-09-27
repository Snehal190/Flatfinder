"use client";

import { useId, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { FloatingBadge } from "@/components/ui/FloatingBadge";
import { ListingArt } from "@/components/ui/ListingArt";
import { AMENITIES, FURNISHING_LABEL, LIFESTYLE, areaLabel, formatRupees, formatRupeesShort } from "@/lib/data/catalog";
import { hasAmenity } from "@/lib/matching/features";
import type { OptionResult } from "@/lib/matching/types";
import { optionSummary } from "@/lib/messages";
import { BalanceMeter } from "./BalanceMeter";
import { PersonColumn } from "./PersonColumn";

const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export function OptionCard({ option }: { option: OptionResult }) {
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  const l = option.listing;
  const area = areaLabel(l.areaId);
  const facts = [
    `${formatRupees(l.rentMonthly)} total`,
    `${formatRupees(l.rentMonthly / 3)} each`,
    `Deposit ${formatRupeesShort(l.deposit)}`,
    l.bhk === 2 ? "2BHK + study" : `${l.bhk}BHK`,
    `${l.bathrooms} bath`,
    `${l.floor === 0 ? "Ground" : `Floor ${l.floor}`} of ${l.totalFloors} · lift ${l.hasLift ? "✓" : "✗"}`,
    FURNISHING_LABEL[l.furnishing],
    l.metroWalkMinutes === null ? "No metro nearby" : `Metro ${l.metroWalkMinutes} min walk`,
    `From ${fmtDate(l.availableFrom)}`,
  ];

  return (
    <article aria-labelledby={`${detailsId}-title`} className="rounded-3xl bg-bg-2/60 p-4 ring-1 ring-ink/5 sm:p-6">
      {option.kind === "near_miss" && (
        <div className="mb-5 rounded-2xl border-2 border-ink bg-bg p-4" role="note">
          <p className="label-util">
            ⚠ Breaks {option.violations.length} must-have{option.violations.length > 1 ? "s" : ""}
          </p>
          <ul className="mt-2 space-y-1">
            {option.violations.map((v) => (
              <li key={`${v.personIndex}-${v.rule}`} className="text-base font-semibold leading-snug">
                {v.personName}&apos;s {v.label.charAt(0).toLowerCase() + v.label.slice(1)} → {v.detail}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-ink/70">Shown because fewer than three flats pass everyone&apos;s dealbreakers. Worth discussing only if she&apos;s open to it.</p>
        </div>
      )}

      <header className="flex items-start gap-4">
        <FloatingBadge size={72} className="sm:!h-24 sm:!w-24">
          <span className="text-[8px] font-black uppercase tracking-widest">Option</span>
          <span className="text-3xl font-black italic leading-none tracking-tighter sm:text-4xl">{option.letter}</span>
        </FloatingBadge>
        <div className="min-w-0 pt-1">
          <p className="label-util flex items-center gap-2"><span aria-hidden className="h-2 w-2 rounded-full bg-accent" />{area}</p>
          <h3 id={`${detailsId}-title`} className="mt-2 text-2xl font-bold leading-[1.05] tracking-tight sm:text-3xl">{l.title}</h3>
          <p className="mt-1 text-sm text-ink/70">{l.society}</p>
        </div>
      </header>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={detailsId}
        aria-label={`View details for option ${option.letter}`}
        className="group relative mt-5 block aspect-[4/3] w-full overflow-hidden rounded-2xl"
      >
        <ListingArt
          seed={l.id}
          areaLabel={area}
          floors={l.totalFloors}
          className="h-full w-full grayscale transition-all duration-reveal ease-house group-hover:scale-[1.08] group-hover:grayscale-0 group-focus-visible:grayscale-0"
        />
        <span className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 scale-75 items-center justify-center rounded-full bg-ink text-center text-[10px] font-bold uppercase tracking-widest text-white opacity-0 transition-all duration-300 ease-house group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100">
          View details
        </span>
      </button>

      <ul className="mt-5 flex flex-wrap gap-x-2 gap-y-1.5 text-[10px] font-black uppercase tracking-[0.2em]" aria-label="Key facts">
        {facts.map((f, i) => (
          <li key={f} className="flex items-center gap-2">{i > 0 && <span aria-hidden className="text-accent">•</span>}{f}</li>
        ))}
      </ul>

      <p className="mt-4 text-base leading-relaxed text-ink/70">{l.description}</p>

      <div className="mt-6 border-l-4 border-accent pl-4">
        <p className="label-util">{option.tag}</p>
        <p className="mt-2 text-xl font-bold leading-snug tracking-tight">{option.tradeoff}</p>
      </div>

      <div className="mt-6 grid overflow-hidden rounded-2xl border border-ink/10 bg-bg sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        {option.people.map((p, i) => (
          <div key={p.name} className={i > 0 ? "border-t border-ink/10 sm:border-l sm:border-t-0 lg:border-l-0 lg:border-t xl:border-l xl:border-t-0" : ""}>
            <PersonColumn p={p} full={open} />
          </div>
        ))}
      </div>

      <div className="mt-6">
        <BalanceMeter scores={option.people.map((p) => p.score)} names={option.people.map((p) => p.name)} label={option.balance} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <CopyButton text={optionSummary(option)} label="Copy summary for WhatsApp" />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={detailsId}
          className="inline-flex min-h-[40px] items-center rounded-full bg-ink px-4 text-[11px] font-bold uppercase tracking-wider text-bg"
        >
          {open ? "Hide details" : "See full details"}
        </button>
      </div>

      <div id={detailsId} hidden={!open} className="mt-6 space-y-6 border-t border-ink/10 pt-6">
        <div>
          <p className="label-util">Address</p>
          <p className="mt-1">{l.address}, {area} · {l.carpetSqft} sq ft carpet · listed by {l.listedBy}</p>
        </div>
        <div>
          <p className="label-util">Rooms</p>
          <ul className="mt-2 grid gap-2 sm:grid-cols-3">
            {l.rooms.map((r) => {
              const who = option.people.find((p) => p.room?.name === r.name)?.name;
              return (
                <li key={r.name} className="rounded-xl bg-bg p-3 text-sm ring-1 ring-ink/10">
                  <p className="font-semibold">{r.name}{who ? ` → ${who}` : ""}</p>
                  <p className="text-ink/70">{r.sqft} sq ft{r.attachedBath ? " · attached bath" : ""}{r.ac ? " · AC" : ""}</p>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="label-util">Flat features</p>
            <ul className="mt-2 space-y-1 text-sm">
              {AMENITIES.map((a) => {
                const ok = hasAmenity(l, a.id, null);
                return <li key={a.id} className={ok ? "" : "text-ink/60"}><span aria-hidden>{ok ? "✓ " : "✗ "}</span>{a.label}<span className="sr-only">{ok ? ": yes" : ": no"}</span></li>;
              })}
            </ul>
          </div>
          <div>
            <p className="label-util">House rules & surroundings</p>
            <ul className="mt-2 space-y-1 text-sm">
              {LIFESTYLE.map((x) => {
                const ok = l.lifestyle.includes(x.id);
                return <li key={x.id} className={ok ? "" : "text-ink/60"}><span aria-hidden>{ok ? "✓ " : "✗ "}</span>{x.label}<span className="sr-only">{ok ? ": yes" : ": no"}</span></li>;
              })}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}
