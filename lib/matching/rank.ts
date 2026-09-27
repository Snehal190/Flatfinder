import type { Listing } from "../data/types";
import type { PersonAnswers } from "../schema";
import { allocateRooms } from "./rooms";
import type { CommuteFn, ListingEvaluation } from "./types";

export function evaluateListing(listing: Listing, people: PersonAnswers[], commute: CommuteFn): ListingEvaluation {
  const evals = allocateRooms(listing, people, commute);
  const scores = evals.map((e) => e.score);
  const violations = evals.flatMap((e) => e.violations);
  return {
    listing,
    people: evals,
    violationCount: violations.length,
    severity: violations.reduce((s, v) => s + v.severity, 0),
    minScore: Math.min(...scores),
    meanScore: scores.reduce((a, b) => a + b, 0) / scores.length,
    spread: Math.max(...scores) - Math.min(...scores),
  };
}

/** Fairness first: highest minimum score, then highest mean, then smallest spread. */
export function compareFairness(a: ListingEvaluation, b: ListingEvaluation): number {
  return b.minScore - a.minScore || b.meanScore - a.meanScore || a.spread - b.spread || a.listing.id.localeCompare(b.listing.id);
}

export function rankEligible(evals: ListingEvaluation[]): ListingEvaluation[] {
  return evals.filter((e) => e.violationCount === 0).sort(compareFairness);
}

/** Near-misses: exactly `n` broken must-haves, least severe first. */
export function nearMisses(evals: ListingEvaluation[], n: number): ListingEvaluation[] {
  return evals
    .filter((e) => e.violationCount === n)
    .sort((a, b) => a.severity - b.severity || compareFairness(a, b));
}
