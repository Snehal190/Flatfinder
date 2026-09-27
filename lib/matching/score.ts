import {
  amenityLabel, anchorTypeLabel, areaLabel, lifestyleLabel,
  type AmenityId, type AreaId, type LifestyleId,
} from "../data/catalog";
import type { Listing } from "../data/types";
import type { PersonAnswers, Strictness } from "../schema";
import { hasAmenity, type RoomFeatures } from "./features";
import type { CommuteResult, Met, Missed } from "./types";

export const WEIGHTS = { item: 1, anchor: 2, area: 2, underBudget: 1, bathrooms: 1 } as const;

/** Credit for a "nice" commute: full within the limit, linear to 0 at limit + 20 min. */
export function commuteCredit(minutes: number, limit: number): number {
  if (minutes <= limit) return 1;
  return Math.max(0, 1 - (minutes - limit) / 20);
}

/** Credit for staying under budget: full at ≤85% of max, linear to 0 at 100%. */
export function underBudgetCredit(share: number, max: number): number {
  const ratio = share / max;
  if (ratio <= 0.85) return 1;
  if (ratio >= 1) return 0;
  return (1 - ratio) / 0.15;
}

export interface ScoreResult {
  score: number;
  met: Met[];
  missed: Missed[];
}

/** Scores only nice-to-haves and soft factors; must-haves are handled as violations. */
export function scorePerson(
  listing: Listing,
  a: PersonAnswers,
  room: RoomFeatures | null,
  commutes: CommuteResult[],
): ScoreResult {
  let earned = 0;
  let total = 0;
  const met: Met[] = [];
  const missed: Missed[] = [];

  const add = (weight: number, credit: number) => {
    total += weight;
    earned += weight * credit;
  };

  for (const [id, s] of Object.entries(a.amenities) as [AmenityId, Strictness][]) {
    if (s !== "nice") continue;
    const ok = hasAmenity(listing, id, room);
    add(WEIGHTS.item, ok ? 1 : 0);
    if (ok) met.push({ rule: `amenity:${id}`, label: amenityLabel(id) });
    else missed.push({ rule: `amenity:${id}`, label: amenityLabel(id), detail: "Not in this flat" });
  }

  for (const [id, s] of Object.entries(a.lifestyle) as [LifestyleId, Strictness][]) {
    if (s !== "nice") continue;
    const ok = listing.lifestyle.includes(id);
    add(WEIGHTS.item, ok ? 1 : 0);
    if (ok) met.push({ rule: `lifestyle:${id}`, label: lifestyleLabel(id) });
    else missed.push({ rule: `lifestyle:${id}`, label: lifestyleLabel(id), detail: "Not offered here" });
  }

  commutes.forEach((c, i) => {
    if (c.anchor.strictness !== "nice") return;
    const credit = commuteCredit(c.minutes, c.anchor.maxMinutes);
    add(WEIGHTS.anchor, credit);
    const label = `${anchorTypeLabel(c.anchor.type)} in ${areaLabel(c.anchor.areaId)} within ${c.anchor.maxMinutes} min`;
    if (c.withinLimit) met.push({ rule: `anchor:${i}`, label: `${label} (${c.minutes} min)` });
    else missed.push({
      rule: `anchor:${i}`, label,
      detail: `${c.minutes} min, +${c.minutes - c.anchor.maxMinutes} min over her preference`,
    });
  });

  const preferred = (Object.entries(a.areas) as [AreaId, "prefer" | "exclude"][])
    .filter(([, v]) => v === "prefer")
    .map(([k]) => k);
  if (preferred.length > 0) {
    const ok = preferred.includes(listing.areaId);
    add(WEIGHTS.area, ok ? 1 : 0);
    if (ok) met.push({ rule: "area", label: `In a preferred area (${areaLabel(listing.areaId)})` });
    else missed.push({
      rule: "area", label: "One of her preferred areas",
      detail: `She prefers ${preferred.map(areaLabel).join(", ")}`,
    });
  }

  if (a.preferUnderBudget) {
    const share = listing.rentMonthly / 3;
    const credit = underBudgetCredit(share, a.maxRent);
    add(WEIGHTS.underBudget, credit);
    const pct = Math.round((share / a.maxRent) * 100);
    if (credit >= 1) met.push({ rule: "under_budget", label: `Comfortably under budget (${pct}% of her max)` });
    else missed.push({ rule: "under_budget", label: "Staying well under budget", detail: `Her share is ${pct}% of her max` });
  }

  if (a.minBathrooms?.strictness === "nice") {
    const ok = listing.bathrooms >= a.minBathrooms.value;
    add(WEIGHTS.bathrooms, ok ? 1 : 0);
    const label = `At least ${a.minBathrooms.value} bathrooms`;
    if (ok) met.push({ rule: "bathrooms", label });
    else missed.push({ rule: "bathrooms", label, detail: `Only ${listing.bathrooms}` });
  }

  const score = total === 0 ? 100 : Math.round((earned / total) * 1000) / 10;
  return { score, met, missed };
}
