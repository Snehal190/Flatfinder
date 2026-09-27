import {
  amenityLabel, anchorTypeLabel, areaLabel, formatRupees, lifestyleLabel,
  type AmenityId, type LifestyleId,
} from "../data/catalog";
import type { Listing } from "../data/types";
import type { PersonAnswers, Strictness } from "../schema";
import { hasAmenity } from "./features";
import { scorePerson } from "./score";
import type { CommuteFn, CommuteResult, PersonEvaluation, RoomAssignment, Violation } from "./types";

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** Whether a listing (and, for room-level features, her room) provides an amenity. */
function floorViolation(listing: Listing, a: PersonAnswers): Violation | null {
  const liftMust = a.amenities.lift === "must";
  const floorOk =
    a.floorRule === "any" ||
    (a.floorRule === "low_only" && listing.floor <= 2) ||
    (a.floorRule === "lift_or_low" && (listing.floor <= 2 || listing.hasLift));
  const liftOk = !liftMust || hasAmenity(listing, "lift", null);
  if (floorOk && liftOk) return null;
  const where = listing.floor === 0 ? "Ground floor" : `Floor ${listing.floor} of ${listing.totalFloors}`;
  const label = a.floorRule === "low_only" ? "Low-floor-only rule (0–2)" : "Lift or low-floor rule";
  return {
    rule: "floor",
    kind: "floor",
    label,
    detail: `${where}, ${listing.hasLift ? "with lift" : "no lift"}`,
    severity: clamp01(0.4 + 0.15 * (listing.floor - 2)),
  };
}

export function evaluatePerson(
  listing: Listing,
  a: PersonAnswers,
  room: RoomAssignment | null,
  commute: CommuteFn,
): PersonEvaluation {
  const violations: Violation[] = [];
  const rentShare = listing.rentMonthly / 3;
  const depositShare = listing.deposit / 3;

  if (rentShare > a.maxRent) {
    const over = rentShare - a.maxRent;
    violations.push({
      rule: "rent", kind: "rent", label: "Budget",
      detail: `${formatRupees(over)} over her ${formatRupees(a.maxRent)} max`,
      severity: clamp01(over / (0.25 * a.maxRent)),
    });
  }
  if (a.maxDeposit !== null && depositShare > a.maxDeposit) {
    const over = depositShare - a.maxDeposit;
    violations.push({
      rule: "deposit", kind: "deposit", label: "Deposit limit",
      detail: `${formatRupees(over)} over her ${formatRupees(a.maxDeposit)} limit`,
      severity: clamp01(over / (0.5 * a.maxDeposit)),
    });
  }
  if (a.areas[listing.areaId] === "exclude") {
    violations.push({
      rule: `area:${listing.areaId}`, kind: "area", label: `Not in ${areaLabel(listing.areaId)}`,
      detail: `${areaLabel(listing.areaId)} is on her won't-consider list`, severity: 1,
    });
  }

  const commutes: CommuteResult[] = a.anchors.map((anchor) => {
    const minutes = commute(listing.areaId, anchor.areaId);
    return { anchor, minutes, withinLimit: minutes <= anchor.maxMinutes };
  });
  commutes.forEach((c, i) => {
    if (c.anchor.strictness === "must" && !c.withinLimit) {
      violations.push({
        rule: `anchor:${i}`, kind: "anchor",
        label: `${c.anchor.maxMinutes}-min limit to ${anchorTypeLabel(c.anchor.type).toLowerCase()} in ${areaLabel(c.anchor.areaId)}`,
        detail: `${c.minutes} min vs her ${c.anchor.maxMinutes} min limit`,
        severity: clamp01((c.minutes - c.anchor.maxMinutes) / 30),
      });
    }
  });

  const fv = floorViolation(listing, a);
  if (fv) violations.push(fv);

  for (const [id, s] of Object.entries(a.amenities) as [AmenityId, Strictness][]) {
    if (s !== "must" || id === "lift") continue; // lift is folded into the floor rule
    if (!hasAmenity(listing, id, room)) {
      const roomLevel = id === "attached_bath" || id === "ac_room";
      violations.push({
        rule: `amenity:${id}`, kind: "amenity", label: amenityLabel(id),
        detail: roomLevel ? "No such room left for her after allocation" : "Not available in this flat",
        severity: 0.6,
      });
    }
  }
  for (const [id, s] of Object.entries(a.lifestyle) as [LifestyleId, Strictness][]) {
    if (s !== "must") continue;
    if (!listing.lifestyle.includes(id)) {
      violations.push({
        rule: `lifestyle:${id}`, kind: "lifestyle", label: lifestyleLabel(id),
        detail: "Not offered by this flat or owner", severity: 0.6,
      });
    }
  }
  if (a.minBathrooms?.strictness === "must" && listing.bathrooms < a.minBathrooms.value) {
    violations.push({
      rule: "bathrooms", kind: "bathrooms", label: `At least ${a.minBathrooms.value} bathrooms`,
      detail: `Only ${listing.bathrooms} bathrooms`,
      severity: clamp01(0.5 * (a.minBathrooms.value - listing.bathrooms)),
    });
  }

  const { score, met, missed } = scorePerson(listing, a, room, commutes);

  return {
    violations,
    met,
    missed,
    commutes,
    rentShare,
    depositShare,
    rentShareVsMax: Math.round((rentShare / a.maxRent) * 100),
    score,
    room,
  };
}
