"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { AREAS, LIFESTYLE, amenityLabel, areaLabel, formatRupees, type AreaId, type LifestyleId } from "@/lib/data/catalog";
import type { CheckedFlatView } from "@/lib/group-view";
import { parseListing, type ParsedFlat } from "@/lib/listing-parse";
import { FLAT_AMENITY_IDS, type FlatFacts } from "@/lib/schema";
import { FlatCheckCard } from "./FlatCheckCard";

type FlatAmenity = (typeof FLAT_AMENITY_IDS)[number];

interface FormState {
  title: string;
  areaId: AreaId | "";
  rent: string;
  deposit: string;
  bhk: number;
  bathrooms: number;
  floor: number;
  totalFloors: number;
  hasLift: boolean | null;
  furnishing: FlatFacts["furnishing"] | null;
  metro: FlatFacts["metro"];
  amenities: FlatAmenity[];
  lifestyle: LifestyleId[];
  attachedBaths: number;
  acRooms: number;
}

const EMPTY: FormState = {
  title: "", areaId: "", rent: "", deposit: "", bhk: 3, bathrooms: 2, floor: 1, totalFloors: 4,
  hasLift: null, furnishing: null, metro: "none", amenities: [], lifestyle: [], attachedBaths: 0, acRooms: 0,
};

const FLOORS = Array.from({ length: 41 }, (_, i) => i);

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="border-t border-ink/10 py-5">
      <p className="text-base font-semibold">{label}</p>
      {hint && <p className="text-sm text-ink/70">{hint}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Choices<T extends string | number | boolean>({ options, value, onChange, label }: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip key={String(o.value)} selected={value === o.value} onClick={() => onChange(o.value)}>{o.label}</Chip>
      ))}
    </div>
  );
}

function detectedSummary(p: ParsedFlat): string[] {
  const out: string[] = [];
  if (p.bhk) out.push(`${p.bhk}BHK`);
  if (p.areaId) out.push(areaLabel(p.areaId));
  if (p.rentMonthly) out.push(`${formatRupees(p.rentMonthly)} rent`);
  if (p.deposit) out.push(`${formatRupees(p.deposit)} deposit`);
  if (p.floor !== undefined) out.push(p.totalFloors ? `floor ${p.floor} of ${p.totalFloors}` : `floor ${p.floor}`);
  if (p.hasLift !== undefined) out.push(p.hasLift ? "lift" : "no lift");
  if (p.bathrooms) out.push(`${p.bathrooms} bathrooms`);
  if (p.furnishing) out.push(p.furnishing === "full" ? "furnished" : p.furnishing === "semi" ? "semi-furnished" : "unfurnished");
  const extras = p.amenities.length + p.lifestyle.length;
  if (extras) out.push(`${extras} feature${extras > 1 ? "s" : ""}`);
  return out;
}

export function FlatChecker({ groupId, names, initialChecks }: { groupId: string; names: string[]; initialChecks: CheckedFlatView[] }) {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [showText, setShowText] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [detected, setDetected] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [checks, setChecks] = useState(initialChecks);
  const [latestId, setLatestId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const read = () => {
    const p = parseListing(url, text);
    setForm((f) => ({
      ...f,
      title: p.title ?? f.title,
      areaId: p.areaId ?? f.areaId,
      rent: p.rentMonthly ? String(p.rentMonthly) : f.rent,
      deposit: p.deposit ? String(p.deposit) : f.deposit,
      bhk: p.bhk ?? f.bhk,
      bathrooms: p.bathrooms ?? f.bathrooms,
      floor: p.floor ?? f.floor,
      totalFloors: Math.max(p.totalFloors ?? f.totalFloors, p.floor ?? 0, 1),
      hasLift: p.hasLift ?? f.hasLift,
      furnishing: p.furnishing ?? f.furnishing,
      amenities: p.amenities.filter((a): a is FlatAmenity => (FLAT_AMENITY_IDS as readonly string[]).includes(a)),
      lifestyle: p.lifestyle,
    }));
    setDetected(detectedSummary(p));
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const submit = async () => {
    setError(null);
    const rent = Number(form.rent.replace(/[^\d]/g, ""));
    const deposit = Number(form.deposit.replace(/[^\d]/g, "") || 0);
    if (!form.areaId) return setError("Pick the area the flat is in.");
    if (!rent) return setError("Add the monthly rent.");
    if (form.hasLift === null) return setError("Say whether there's a lift.");
    if (form.floor > form.totalFloors) return setError("The floor can't be higher than the building.");
    const facts: FlatFacts = {
      url: url.trim() || "",
      title: form.title.trim() || `${form.bhk}BHK in ${areaLabel(form.areaId)}`,
      areaId: form.areaId,
      rentMonthly: rent,
      deposit,
      bhk: form.bhk,
      bathrooms: form.bathrooms,
      floor: form.floor,
      totalFloors: form.totalFloors,
      hasLift: form.hasLift,
      furnishing: form.furnishing ?? "semi",
      metro: form.metro,
      amenities: form.amenities,
      lifestyle: form.lifestyle,
      attachedBaths: form.attachedBaths,
      acRooms: form.acRooms,
    };
    setBusy(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/checks`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(facts) });
      const body = (await res.json()) as CheckedFlatView & { error?: string };
      if (!res.ok) {
        setError(body.error ?? "Something went wrong.");
        return;
      }
      setChecks((c) => [body, ...c]);
      setLatestId(body.id);
      setUrl("");
      setText("");
      setForm(EMPTY);
      setDetected(null);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch {
      setError("Couldn't reach the server. Try again?");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    setChecks((c) => c.filter((x) => x.id !== id));
    await fetch(`/api/groups/${groupId}/checks/${id}`, { method: "DELETE" }).catch(() => undefined);
  };

  return (
    <main className="mx-auto max-w-[720px] px-4 pb-24 pt-10 sm:pt-14">
      <Link href={`/g/${groupId}`} className="text-sm font-semibold underline decoration-accent decoration-2 underline-offset-4">← Back to our options</Link>
      <h1 className="mt-6 text-5xl font-black leading-[0.9] tracking-tighter sm:text-6xl">Found a flat? Check it.</h1>
      <p className="mt-4 text-lg leading-relaxed text-ink/70">
        Paste a link from 99acres, Housing.com, MagicBricks, NoBroker or anywhere else. We&apos;ll check it against {names.join(", ")}&apos;s answers before anyone gets attached.
      </p>

      {/* Step 1: link */}
      <section className="mt-10 rounded-3xl bg-bg-2 p-5 ring-1 ring-ink/5 sm:p-7">
        <label htmlFor="flat-url" className="text-xl font-bold tracking-tight">1. Paste the listing link</label>
        <input
          id="flat-url"
          type="url"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.99acres.com/3-bhk-…"
          className="mt-3 block min-h-[52px] w-full rounded-2xl border border-ink/15 bg-bg px-4 text-base placeholder:text-ink/40 focus:border-ink"
        />
        {!showText ? (
          <button type="button" onClick={() => setShowText(true)} className="mt-3 text-sm font-semibold underline decoration-accent decoration-2 underline-offset-4">
            + Also paste the listing description (fills in much more)
          </button>
        ) : (
          <>
            <label htmlFor="flat-text" className="mt-5 block text-sm font-semibold">Listing description <span className="font-normal text-ink/70">(copy everything from the listing page)</span></label>
            <textarea
              id="flat-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder="e.g. Spacious 3 BHK, rent ₹45,000, 5th floor of 12, lift, covered parking, no pets…"
              className="mt-2 block w-full rounded-2xl border border-ink/15 bg-bg p-4 text-base placeholder:text-ink/40 focus:border-ink"
            />
          </>
        )}
        <Button variant="accent" onClick={read} disabled={!url.trim() && !text.trim()} className="mt-5 w-full sm:w-auto">
          Fill in the details →
        </Button>
        <p className="mt-3 text-xs leading-relaxed text-ink/70">
          Listing sites don&apos;t let other apps open their pages, so we read what&apos;s in the link and any text you paste. You can fix anything below.
        </p>
      </section>

      {/* Step 2: confirm facts */}
      <section ref={formRef} className="mt-10 scroll-mt-28">
        <h2 className="text-xl font-bold tracking-tight">2. Check the details</h2>
        {detected && (
          <p className="mt-3 rounded-2xl border border-ink/15 p-4 text-sm leading-relaxed">
            {detected.length > 0 ? (
              <><strong>We filled in:</strong> {detected.join(" · ")}. Please check the rest.</>
            ) : (
              <>We couldn&apos;t read much from that. Fill in the details below; pasting the listing description helps.</>
            )}
          </p>
        )}

        <div className="mt-4">
          <Field label="Name for this flat" hint="So you can tell them apart later.">
            <input
              value={form.title}
              maxLength={120}
              onChange={(e) => set({ title: e.target.value })}
              placeholder="e.g. 3BHK near Balewadi High Street"
              className="block min-h-[48px] w-full rounded-2xl border border-ink/15 bg-bg px-4 text-base placeholder:text-ink/40 focus:border-ink"
            />
          </Field>
          <Field label="Area">
            <select
              aria-label="Area"
              value={form.areaId}
              onChange={(e) => set({ areaId: e.target.value as AreaId })}
              className="min-h-[48px] w-full rounded-full border border-ink/20 bg-bg px-4 text-base font-semibold"
            >
              <option value="">Choose the area…</option>
              {AREAS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Rent / month (total)">
              <input inputMode="numeric" aria-label="Monthly rent" value={form.rent} onChange={(e) => set({ rent: e.target.value })} placeholder="45000"
                className="block min-h-[48px] w-full rounded-2xl border border-ink/15 bg-bg px-4 text-lg font-bold placeholder:font-normal placeholder:text-ink/40 focus:border-ink" />
            </Field>
            <Field label="Deposit (total)">
              <input inputMode="numeric" aria-label="Deposit" value={form.deposit} onChange={(e) => set({ deposit: e.target.value })} placeholder="150000"
                className="block min-h-[48px] w-full rounded-2xl border border-ink/15 bg-bg px-4 text-lg font-bold placeholder:font-normal placeholder:text-ink/40 focus:border-ink" />
            </Field>
          </div>
          <Field label="Bedrooms">
            <Choices label="Bedrooms" value={form.bhk} onChange={(bhk) => set({ bhk })} options={[1, 2, 3, 4].map((n) => ({ value: n, label: `${n}BHK` }))} />
          </Field>
          <Field label="Bathrooms">
            <Choices label="Bathrooms" value={form.bathrooms} onChange={(bathrooms) => set({ bathrooms })} options={[1, 2, 3, 4].map((n) => ({ value: n, label: String(n) }))} />
          </Field>
          <Field label="Floor">
            <div className="flex items-center gap-3">
              <select aria-label="Floor" value={form.floor} onChange={(e) => set({ floor: Number(e.target.value) })} className="min-h-[48px] flex-1 rounded-full border border-ink/20 bg-bg px-4 font-semibold">
                {FLOORS.map((n) => <option key={n} value={n}>{n === 0 ? "Ground" : `Floor ${n}`}</option>)}
              </select>
              <span className="text-ink/70">of</span>
              <select aria-label="Total floors" value={form.totalFloors} onChange={(e) => set({ totalFloors: Number(e.target.value) })} className="min-h-[48px] flex-1 rounded-full border border-ink/20 bg-bg px-4 font-semibold">
                {FLOORS.slice(1).map((n) => <option key={n} value={n}>{n} floor{n > 1 ? "s" : ""}</option>)}
              </select>
            </div>
          </Field>
          <Field label="Lift?">
            <Choices label="Lift" value={form.hasLift} onChange={(hasLift) => set({ hasLift })} options={[{ value: true, label: "Yes" }, { value: false, label: "No" }]} />
          </Field>
          <Field label="Furnishing">
            <Choices label="Furnishing" value={form.furnishing} onChange={(furnishing) => set({ furnishing })}
              options={[{ value: "unfurnished", label: "Unfurnished" }, { value: "semi", label: "Semi" }, { value: "full", label: "Fully furnished" }]} />
          </Field>
          <Field label="Metro station">
            <Choices label="Metro" value={form.metro} onChange={(metro) => set({ metro })}
              options={[{ value: "near", label: "Within 15 min walk" }, { value: "far", label: "Further" }, { value: "none", label: "None / not sure" }]} />
          </Field>
          <Field label="Bedrooms with attached bathroom">
            <Choices label="Attached bathrooms" value={form.attachedBaths} onChange={(attachedBaths) => set({ attachedBaths })} options={[0, 1, 2, 3].map((n) => ({ value: n, label: String(n) }))} />
          </Field>
          <Field label="Bedrooms with AC">
            <Choices label="AC rooms" value={form.acRooms} onChange={(acRooms) => set({ acRooms })} options={[0, 1, 2, 3].map((n) => ({ value: n, label: String(n) }))} />
          </Field>
          <Field label="What the flat has" hint="Tap everything that applies. Anything left untapped counts as not available.">
            <div className="flex flex-wrap gap-2">
              {FLAT_AMENITY_IDS.map((a) => (
                <Chip key={a} selected={form.amenities.includes(a)} onClick={() => set({ amenities: toggle(form.amenities, a) })}>{amenityLabel(a)}</Chip>
              ))}
            </div>
          </Field>
          <Field label="House rules & surroundings" hint="Tap what the listing or owner allows.">
            <div className="flex flex-wrap gap-2">
              {LIFESTYLE.map((l) => (
                <Chip key={l.id} selected={form.lifestyle.includes(l.id)} onClick={() => set({ lifestyle: toggle(form.lifestyle, l.id) })}>{l.label}</Chip>
              ))}
            </div>
          </Field>
        </div>

        {error && <p role="alert" className="mt-4 font-semibold">⚠ {error}</p>}
        <Button variant="ink" onClick={submit} disabled={busy} className="mt-6 w-full py-4 text-sm">
          {busy ? "Checking…" : "Check this flat for all three →"}
        </Button>
      </section>

      {/* Results */}
      <section ref={resultRef} className="mt-16 scroll-mt-28" aria-labelledby="checked-heading">
        <h2 id="checked-heading" className="text-3xl font-bold tracking-tight">Flats you&apos;ve checked</h2>
        <p className="mt-2 text-ink/70">Everyone in the group sees these. They re-check automatically if anyone changes her answers.</p>
        {checks.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-ink/20 p-6 text-center text-ink/70">Nothing checked yet.</p>
        ) : (
          <div className="mt-6 space-y-6">
            {checks.map((c) => (
              <FlatCheckCard key={c.id} check={c} defaultOpen={c.id === latestId} onDelete={() => remove(c.id)} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
