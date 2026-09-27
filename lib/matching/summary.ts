import {
  amenityLabel, amenityShort, anchorTypeLabel, areaLabel, formatRupees, lifestyleLabel, lifestyleShort,
  type AmenityId, type AreaId, type LifestyleId,
} from "../data/catalog";
import type { Strictness } from "../schema";
import type {
  BalanceLabel, CloseCall, ExclusionCategory, ListingEvaluation, NamedViolation, PersonEvaluation, PersonInput,
} from "./types";

export function balanceLabel(spread: number): BalanceLabel {
  if (spread <= 15) return "Evenly shared compromise";
  if (spread <= 35) return "Somewhat uneven";
  return "One person carries most of it";
}

/**
 * Who each option favours, relative to how that person scores across the whole pool —
 * so "leans Kavita" means "better for Kavita than her typical option", not just "Kavita's highest score".
 */
export function tradeoffProfile(
  e: ListingEvaluation,
  baselines: number[],
): { favoured: number | null; compromises: number | null } {
  const rel = e.people.map((p, i) => p.score - baselines[i]);
  const max = Math.max(...rel);
  const min = Math.min(...rel);
  if (max - min < 5) return { favoured: null, compromises: null };
  return { favoured: rel.indexOf(max), compromises: rel.indexOf(min) };
}

export function profileTag(names: string[], favoured: number | null, compromises: number | null): string {
  if (favoured === null || compromises === null) return "Evenly balanced";
  return `Leans ${names[favoured]} · ${names[compromises]} compromises`;
}

const listJoin = (xs: string[]) =>
  xs.length <= 1 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;

function ruleShort(rule: string): string {
  const [kind, id] = rule.split(":");
  if (kind === "amenity") return amenityShort(id as AmenityId);
  if (kind === "lifestyle") return lifestyleShort(id as LifestyleId);
  return "";
}

function gainPhrase(p: PersonEvaluation, areaId: AreaId): string {
  const parts: string[] = [];
  const bestCommute = [...p.commutes]
    .filter((c) => c.withinLimit)
    .sort((a, b) => a.minutes - a.anchor.maxMinutes - (b.minutes - b.anchor.maxMinutes))[0];
  if (bestCommute) parts.push(`a ${bestCommute.minutes}-min commute to ${areaLabel(bestCommute.anchor.areaId)}`);
  if (p.met.some((m) => m.rule === "area")) parts.push(`her preferred ${areaLabel(areaId)}`);
  for (const m of p.met) {
    if (parts.length >= 2) break;
    const s = ruleShort(m.rule);
    if (s) parts.push(s);
  }
  if (parts.length === 0 && p.met.length > 0) parts.push(p.met[0].label.toLowerCase());
  return parts.length ? listJoin(parts.slice(0, 2)) : "a flat that clears all her dealbreakers";
}

function givePhrase(p: PersonEvaluation): string | null {
  const parts: string[] = [];
  const anchorMiss = p.missed.find((m) => m.rule.startsWith("anchor:"));
  if (anchorMiss) {
    const i = Number(anchorMiss.rule.split(":")[1]);
    const c = p.commutes[i];
    parts.push(`a short commute to her ${anchorTypeLabel(c.anchor.type).toLowerCase()} (+${c.minutes - c.anchor.maxMinutes} min over her preference)`);
  }
  if (p.missed.some((m) => m.rule === "area")) parts.push("living in one of her preferred areas");
  for (const m of p.missed) {
    if (parts.length >= 2) break;
    const s = ruleShort(m.rule);
    if (s) parts.push(s);
  }
  if (parts.length === 0 && p.missed.length > 0) parts.push(p.missed[0].label.toLowerCase());
  return parts.length ? listJoin(parts.slice(0, 2)) : null;
}

export function tradeoffLine(
  e: ListingEvaluation,
  names: string[],
  favoured: number | null,
  compromises: number | null,
): string {
  if (favoured === null || compromises === null) {
    const lowest = e.people.reduce((lo, p, i) => (p.score < e.people[lo].score ? i : lo), 0);
    const give = givePhrase(e.people[lowest]);
    return give
      ? `Roughly even for all three. The biggest ask is ${names[lowest]} giving up ${give}.`
      : "Roughly even for all three, and nobody gives up much from her wishlist.";
  }
  const gain = gainPhrase(e.people[favoured], e.listing.areaId);
  const give = givePhrase(e.people[compromises]);
  return give
    ? `${names[favoured]} gets ${gain}; ${names[compromises]} gives up ${give}.`
    : `${names[favoured]} gets ${gain}; ${names[compromises]} keeps her wishlist but gains the least here.`;
}

export function namedViolations(e: ListingEvaluation, names: string[]): NamedViolation[] {
  return e.people.flatMap((p, i) => p.violations.map((v) => ({ ...v, personIndex: i, personName: names[i] })));
}

function categoryFor(v: NamedViolation, people: PersonInput[]): { key: string; label: string } {
  const n = v.personName;
  switch (v.kind) {
    case "rent":
      return { key: `rent:${v.personIndex}`, label: `Over budget for ${n}` };
    case "deposit":
      return { key: `deposit:${v.personIndex}`, label: `Deposit above ${n}'s limit` };
    case "area": {
      const areaId = v.rule.split(":")[1] as AreaId;
      return { key: `area:${v.personIndex}:${areaId}`, label: `In ${areaLabel(areaId)}, which ${n} won't consider` };
    }
    case "anchor": {
      const i = Number(v.rule.split(":")[1]);
      const anc = people[v.personIndex].answers.anchors[i];
      return {
        key: `anchor:${v.personIndex}:${i}`,
        label: `Too far from ${n}'s ${anchorTypeLabel(anc.type).toLowerCase()} in ${areaLabel(anc.areaId)} (${anc.maxMinutes}-min limit)`,
      };
    }
    case "floor":
      return { key: `floor:${v.personIndex}`, label: `Lift / floor rule for ${n}` };
    case "amenity":
      return { key: `${v.rule}:${v.personIndex}`, label: `Missing ${amenityLabel(v.rule.split(":")[1] as AmenityId).toLowerCase()} (${n}'s must-have)` };
    case "lifestyle":
      return { key: `${v.rule}:${v.personIndex}`, label: `Missing “${lifestyleLabel(v.rule.split(":")[1] as LifestyleId).toLowerCase()}” (${n}'s must-have)` };
    case "bathrooms":
      return { key: `bathrooms:${v.personIndex}`, label: `Too few bathrooms for ${n}` };
  }
}

/** Every excluded listing appears in at least one category (a listing may appear in several). */
export function exclusionSummary(evals: ListingEvaluation[], people: PersonInput[]): ExclusionCategory[] {
  const names = people.map((p) => p.name);
  const map = new Map<string, ExclusionCategory>();
  for (const e of evals) {
    if (e.violationCount === 0) continue;
    const seen = new Set<string>();
    for (const v of namedViolations(e, names)) {
      const { key, label } = categoryFor(v, people);
      if (seen.has(key)) continue;
      seen.add(key);
      const cat = map.get(key) ?? { key, label, personName: v.personName, count: 0, listings: [] };
      cat.count += 1;
      cat.listings.push({ id: e.listing.id, title: e.listing.title });
      map.set(key, cat);
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function closeCalls(evals: ListingEvaluation[], names: string[]): CloseCall[] {
  return evals
    .filter((e) => e.violationCount === 1)
    .sort((a, b) => a.severity - b.severity)
    .map((e) => ({
      listing: { id: e.listing.id, title: e.listing.title, areaId: e.listing.areaId },
      violation: namedViolations(e, names)[0],
    }));
}

/** Plain-language list of each person's dealbreakers, for the "ground rules" strip. */
export function mustHaveList(p: PersonInput): string[] {
  const a = p.answers;
  const out: string[] = [`Her share of rent ≤ ${formatRupees(a.maxRent)}`];
  if (a.maxDeposit !== null) out.push(`Her share of deposit ≤ ${formatRupees(a.maxDeposit)}`);
  const excluded = (Object.entries(a.areas) as [AreaId, string][]).filter(([, v]) => v === "exclude").map(([k]) => areaLabel(k));
  if (excluded.length) out.push(`Not in ${listJoin(excluded)}`);
  for (const anc of a.anchors) {
    if (anc.strictness === "must") out.push(`≤ ${anc.maxMinutes} min to ${anchorTypeLabel(anc.type).toLowerCase()} (${areaLabel(anc.areaId)})`);
  }
  if (a.floorRule === "low_only") out.push("Ground to 2nd floor only");
  if (a.floorRule === "lift_or_low" || a.amenities.lift === "must") out.push("Lift, or a low floor");
  for (const [id, s] of Object.entries(a.amenities) as [AmenityId, Strictness][]) {
    if (s === "must" && id !== "lift") out.push(amenityLabel(id));
  }
  for (const [id, s] of Object.entries(a.lifestyle) as [LifestyleId, Strictness][]) {
    if (s === "must") out.push(lifestyleLabel(id));
  }
  if (a.minBathrooms?.strictness === "must") out.push(`At least ${a.minBathrooms.value} bathrooms`);
  return out;
}
