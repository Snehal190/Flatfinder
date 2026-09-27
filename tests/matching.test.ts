import { describe, expect, it } from "vitest";
import type { AreaId } from "@/lib/data/catalog";
import { getCommute } from "@/lib/data/commute";
import { getListings } from "@/lib/data/listings";
import type { Listing } from "@/lib/data/types";
import { DEMO_ANSWERS, DEMO_NAMES } from "@/lib/demo";
import {
  allocateRooms, commuteCredit, computeResults, evaluateListing, evaluatePerson, exclusionSummary,
  rankEligible, selectDiverse, type CommuteFn, type ListingEvaluation, type PersonInput,
} from "@/lib/matching";
import { DEFAULT_ANSWERS, type PersonAnswers } from "@/lib/schema";

const flatCommute = (m: number): CommuteFn => (a, b) => (a === b ? 10 : m);

function listing(over: Partial<Listing> = {}): Listing {
  return {
    id: "t-1", title: "Test flat", areaId: "baner", society: "Test", address: "Test",
    rentMonthly: 45000, deposit: 90000, bhk: 3, bathrooms: 3, carpetSqft: 1200,
    floor: 2, totalFloors: 8, hasLift: true, furnishing: "semi",
    amenities: ["parking_2w", "gated"], lifestyle: ["guests_overnight"],
    rooms: [
      { name: "Master bedroom", sqft: 200, attachedBath: true, ac: false },
      { name: "Bedroom 2", sqft: 170, attachedBath: false, ac: true },
      { name: "Bedroom 3", sqft: 150, attachedBath: false, ac: false },
    ],
    metroWalkMinutes: 10, availableFrom: "2026-10-15", description: "", listedBy: "owner",
    ...over,
  };
}

const answers = (over: Partial<PersonAnswers> = {}): PersonAnswers => ({ ...DEFAULT_ANSWERS, maxRent: 20000, maxDeposit: null, ...over });
const rules = (a: PersonAnswers, l: Listing, c: CommuteFn = flatCommute(20)) =>
  evaluatePerson(l, a, null, c).violations.map((v) => v.rule);

describe("hard rules", () => {
  it("rent share over max", () => {
    const v = evaluatePerson(listing({ rentMonthly: 66000 }), answers({ maxRent: 20000 }), null, flatCommute(20)).violations;
    expect(v).toHaveLength(1);
    expect(v[0].rule).toBe("rent");
    expect(v[0].detail).toContain("₹2,000 over");
  });

  it("rent exactly at max passes", () => {
    expect(rules(answers({ maxRent: 15000 }), listing({ rentMonthly: 45000 }))).toEqual([]);
  });

  it("deposit share over max; null means no limit", () => {
    expect(rules(answers({ maxDeposit: 25000 }), listing({ deposit: 90000 }))).toEqual(["deposit"]);
    expect(rules(answers({ maxDeposit: null }), listing({ deposit: 900000 }))).toEqual([]);
  });

  it("excluded area", () => {
    expect(rules(answers({ areas: { baner: "exclude" } }), listing())).toEqual(["area:baner"]);
    expect(rules(answers({ areas: { baner: "prefer" } }), listing())).toEqual([]);
  });

  it("must anchor over its limit, with gap in the detail; nice anchor never violates", () => {
    const a = answers({ anchors: [{ type: "gym", areaId: "aundh", maxMinutes: 20, strictness: "must" }] });
    const v = evaluatePerson(listing(), a, null, flatCommute(35)).violations;
    expect(v.map((x) => x.rule)).toEqual(["anchor:0"]);
    expect(v[0].detail).toBe("35 min vs her 20 min limit");
    const nice = answers({ anchors: [{ type: "gym", areaId: "aundh", maxMinutes: 20, strictness: "nice" }] });
    expect(rules(nice, listing(), flatCommute(35))).toEqual([]);
  });

  it("missing must amenity and lifestyle", () => {
    const a = answers({ amenities: { pet_friendly: "must" }, lifestyle: { nonveg: "must" } });
    expect(rules(a, listing())).toEqual(["amenity:pet_friendly", "lifestyle:nonveg"]);
  });

  it("floor rules", () => {
    const low = answers({ floorRule: "low_only" });
    expect(rules(low, listing({ floor: 2 }))).toEqual([]);
    expect(rules(low, listing({ floor: 3, hasLift: true }))).toEqual(["floor"]);
    const lift = answers({ floorRule: "lift_or_low" });
    expect(rules(lift, listing({ floor: 7, hasLift: true }))).toEqual([]);
    expect(rules(lift, listing({ floor: 2, hasLift: false }))).toEqual([]);
    expect(rules(lift, listing({ floor: 5, hasLift: false }))).toEqual(["floor"]);
  });

  it("lift must + floor rule collapse into one violation", () => {
    const a = answers({ floorRule: "lift_or_low", amenities: { lift: "must" } });
    expect(rules(a, listing({ floor: 5, hasLift: false }))).toEqual(["floor"]);
    // 2nd floor without lift is fine for the floor rule but not for "lift (or ground/1st)"
    expect(rules(a, listing({ floor: 2, hasLift: false }))).toEqual(["floor"]);
    expect(rules(a, listing({ floor: 1, hasLift: false }))).toEqual([]);
  });

  it("minimum bathrooms must", () => {
    const a = answers({ minBathrooms: { value: 3, strictness: "must" } });
    expect(rules(a, listing({ bathrooms: 2 }))).toEqual(["bathrooms"]);
    expect(rules(a, listing({ bathrooms: 3 }))).toEqual([]);
  });

  it("attached bathroom must is satisfied if any room has one (unallocated)", () => {
    const a = answers({ amenities: { attached_bath: "must" } });
    expect(rules(a, listing())).toEqual([]);
    const none = listing({ rooms: listing().rooms.map((r) => ({ ...r, attachedBath: false })) });
    expect(rules(a, none)).toEqual(["amenity:attached_bath"]);
  });

  it("severity grows with the size of the gap", () => {
    const a = answers({ anchors: [{ type: "office", areaId: "hinjewadi", maxMinutes: 30, strictness: "must" }] });
    const small = evaluatePerson(listing(), a, null, flatCommute(35)).violations[0].severity;
    const big = evaluatePerson(listing(), a, null, flatCommute(55)).violations[0].severity;
    expect(small).toBeLessThan(big);
  });
});

describe("score", () => {
  it("is 100 when the person has no preferences", () => {
    expect(evaluatePerson(listing(), answers(), null, flatCommute(20)).score).toBe(100);
  });

  it("weights nice items 1, anchors 2, preferred area 2", () => {
    const a = answers({
      amenities: { gated: "nice", pet_friendly: "nice" }, // 1 of 2
      areas: { aundh: "prefer" }, // miss, weight 2
      anchors: [{ type: "office", areaId: "aundh", maxMinutes: 30, strictness: "nice" }], // within, weight 2
    });
    // earned 1 + 0 + 2 + 0 = 3 of 6
    expect(evaluatePerson(listing(), a, null, flatCommute(20)).score).toBe(50);
  });

  it("commute credit decays linearly to 0 at limit + 20", () => {
    expect(commuteCredit(30, 30)).toBe(1);
    expect(commuteCredit(40, 30)).toBeCloseTo(0.5);
    expect(commuteCredit(50, 30)).toBe(0);
    expect(commuteCredit(70, 30)).toBe(0);
    const a = answers({ anchors: [{ type: "office", areaId: "aundh", maxMinutes: 30, strictness: "nice" }] });
    expect(evaluatePerson(listing(), a, null, flatCommute(45)).score).toBe(25);
  });

  it("prefer-under-budget: full at ≤85%, zero at 100%", () => {
    const a = answers({ maxRent: 20000, preferUnderBudget: true });
    expect(evaluatePerson(listing({ rentMonthly: 51000 }), a, null, flatCommute(20)).score).toBe(100); // 85%
    expect(evaluatePerson(listing({ rentMonthly: 60000 }), a, null, flatCommute(20)).score).toBe(0); // 100%
    expect(evaluatePerson(listing({ rentMonthly: 55500 }), a, null, flatCommute(20)).score).toBeCloseTo(50, 0);
  });

  it("nice min bathrooms", () => {
    const a = answers({ minBathrooms: { value: 3, strictness: "nice" }, amenities: { gated: "nice" } });
    expect(evaluatePerson(listing({ bathrooms: 2 }), a, null, flatCommute(20)).score).toBe(50);
  });
});

describe("room allocation", () => {
  it("gives the attached bath and AC rooms to the people who asked for them", () => {
    const people = [
      answers(),
      answers({ amenities: { ac_room: "nice" } }),
      answers({ amenities: { attached_bath: "nice" } }),
    ];
    const evals = allocateRooms(listing(), people, flatCommute(20));
    expect(evals[2].room?.name).toBe("Master bedroom");
    expect(evals[1].room?.name).toBe("Bedroom 2");
    expect(evals.map((e) => e.score)).toEqual([100, 100, 100]);
  });

  it("flags a must when two people need an attached bath and only one room has it", () => {
    const people = [answers({ amenities: { attached_bath: "must" } }), answers({ amenities: { attached_bath: "must" } }), answers()];
    const e = evaluateListing(listing(), people, flatCommute(20));
    expect(e.violationCount).toBe(1);
    const two = listing({ rooms: listing().rooms.map((r, i) => ({ ...r, attachedBath: i < 2 })) });
    expect(evaluateListing(two, people, flatCommute(20)).violationCount).toBe(0);
  });

  it("maximises the minimum score", () => {
    const people = [
      answers({ amenities: { attached_bath: "nice", gated: "nice" } }), // gets 50 without bath
      answers({ amenities: { attached_bath: "nice" } }), // gets 0 without bath
      answers(),
    ];
    const evals = allocateRooms(listing(), people, flatCommute(20));
    expect(evals[1].room?.attachedBath).toBe(true);
  });
});

describe("ranking and diversification", () => {
  const mk = (id: string, areaId: AreaId, scores: number[]): ListingEvaluation => ({
    listing: listing({ id, areaId }),
    people: scores.map((score) => ({
      violations: [], met: [], missed: [], commutes: [], rentShare: 0, depositShare: 0, rentShareVsMax: 0, score, room: null,
    })),
    violationCount: 0,
    severity: 0,
    minScore: Math.min(...scores),
    meanScore: scores.reduce((a, b) => a + b, 0) / scores.length,
    spread: Math.max(...scores) - Math.min(...scores),
  });

  it("sorts by min score, then mean, then spread", () => {
    const fair = mk("fair", "baner", [70, 70, 70]);
    const lopsided = mk("lopsided", "baner", [95, 95, 30]);
    const tieHigherMean = mk("tie-mean", "baner", [70, 80, 80]);
    const withViolation = { ...mk("bad", "baner", [100, 100, 100]), violationCount: 1 };
    expect(rankEligible([lopsided, fair, withViolation, tieHigherMean]).map((e) => e.listing.id)).toEqual([
      "tie-mean", "fair", "lopsided",
    ]);
  });

  it("avoids three near-identical flats in the same area when alternatives exist", () => {
    const pool = [
      mk("b1", "baner", [80, 80, 80]),
      mk("b2", "baner", [79, 79, 79]),
      mk("b3", "baner", [78, 78, 78]),
      mk("w1", "wakad", [60, 85, 70]),
      mk("p1", "pashan", [85, 60, 65]),
    ];
    const picks = selectDiverse(pool, 3);
    expect(picks[0].listing.id).toBe("b1");
    expect(new Set(picks.map((p) => p.listing.areaId)).size).toBe(3);
  });
});

describe("near-miss fallback and exclusions", () => {
  const people: PersonInput[] = [
    { name: "A", answers: answers({ maxRent: 20000 }) },
    { name: "B", answers: answers({ maxRent: 20000, floorRule: "low_only" }) },
    { name: "C", answers: answers({ maxRent: 20000, amenities: { pet_friendly: "must" } }) },
  ];
  const ok = listing({ id: "ok", amenities: ["pet_friendly"] });
  const oneSmall = listing({ id: "one-small", rentMonthly: 61500, amenities: ["pet_friendly"] }); // rent over for all three → 3 violations
  const floorMiss = listing({ id: "floor-miss", floor: 3, amenities: ["pet_friendly"] }); // 1 violation, 0.55
  const petMiss = listing({ id: "pet-miss" }); // 1 violation, 0.6
  const twoMiss = listing({ id: "two-miss", floor: 4 }); // 2 violations

  it("fills empty slots with one-must-have misses first, least severe first, and flags them", () => {
    const r = computeResults(people, [ok, oneSmall, floorMiss, petMiss, twoMiss], flatCommute(20));
    expect(r.options.map((o) => [o.listing.id, o.kind])).toEqual([
      ["ok", "eligible"], ["floor-miss", "near_miss"], ["pet-miss", "near_miss"],
    ]);
    expect(r.options[1].violations[0].personName).toBe("B");
    expect(r.options.map((o) => o.letter)).toEqual(["A", "B", "C"]);
  });

  it("falls back to two-must-have misses when needed", () => {
    const r = computeResults(people, [floorMiss, twoMiss], flatCommute(20));
    expect(r.options.map((o) => o.listing.id)).toEqual(["floor-miss", "two-miss"]);
    expect(r.options.every((o) => o.kind === "near_miss")).toBe(true);
  });

  it("exclusion summary accounts for every excluded listing", () => {
    const all = [ok, oneSmall, floorMiss, petMiss, twoMiss];
    const evals = all.map((l) => evaluateListing(l, people.map((p) => p.answers), flatCommute(20)));
    const cats = exclusionSummary(evals, people);
    const covered = new Set(cats.flatMap((c) => c.listings.map((l) => l.id)));
    expect([...covered].sort()).toEqual(["floor-miss", "one-small", "pet-miss", "two-miss"]);
    expect(cats.find((c) => c.key === "rent:0")?.count).toBe(1);
  });
});

describe("demo scenario", () => {
  const people = DEMO_NAMES.map((name) => ({ name, answers: DEMO_ANSWERS[name] }));
  const r = computeResults(people, getListings(), getCommute);

  it("has 3–6 eligible flats and returns three eligible options", () => {
    expect(r.eligibleCount).toBeGreaterThanOrEqual(3);
    expect(r.eligibleCount).toBeLessThanOrEqual(6);
    expect(r.options).toHaveLength(3);
    expect(r.options.every((o) => o.kind === "eligible" && o.violations.length === 0)).toBe(true);
  });

  it("options favour at least two different people and span different areas", () => {
    const favoured = new Set(r.options.map((o) => o.favoured));
    expect(favoured.size).toBeGreaterThanOrEqual(2);
    expect(new Set(r.options.map((o) => o.listing.areaId)).size).toBe(3);
  });

  it("includes the story's near-misses", () => {
    const calls = new Map(r.closeCalls.map((c) => [c.listing.id, c.violation]));
    expect(calls.get("bnr-01")?.personName).toBe("Kavita"); // great Baner flat, 5 min too far
    expect(calls.get("bnr-01")?.detail).toBe("35 min vs her 30 min limit");
    expect(calls.get("pas-02")?.kind).toBe("floor"); // lovely 5th-floor walk-up fails Meera
    const kothrud = evaluateListing(getListings().find((l) => l.id === "kot-01") as Listing, people.map((p) => p.answers), getCommute);
    expect(kothrud.people[0].violations.map((v) => v.kind)).toContain("anchor"); // Riya's Aundh limit
  });

  it("every excluded listing is explained", () => {
    const covered = new Set(r.exclusions.flatMap((c) => c.listings.map((l) => l.id)));
    expect(covered.size).toBe(r.excludedCount);
  });

  it("never uses ranking language", () => {
    const text = JSON.stringify(r.options.map((o) => [o.tag, o.tradeoff, o.balance]));
    expect(text).not.toMatch(/best|recommended|#1|top pick/i);
  });
});
