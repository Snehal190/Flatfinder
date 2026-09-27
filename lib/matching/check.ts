import type { Listing } from "../data/types";
import { evaluateListing } from "./rank";
import { balanceLabel, namedViolations, profileTag, tradeoffLine } from "./summary";
import type { BalanceLabel, CommuteFn, NamedViolation, PersonEvaluation, PersonInput } from "./types";

export type CheckVerdict = "fits" | "near" | "no";

export interface FlatCheck {
  verdict: CheckVerdict;
  violations: NamedViolation[];
  people: (PersonEvaluation & { name: string })[];
  minScore: number;
  meanScore: number;
  balance: BalanceLabel;
  tag: string;
  tradeoff: string;
}

/** Evaluates one flat someone found against the whole group. */
export function checkFlat(listing: Listing, people: PersonInput[], commute: CommuteFn): FlatCheck {
  const names = people.map((p) => p.name);
  const e = evaluateListing(listing, people.map((p) => p.answers), commute);
  const scores = e.people.map((p) => p.score);
  const spreadWide = e.spread >= 10;
  const favoured = spreadWide ? scores.indexOf(Math.max(...scores)) : null;
  const compromises = spreadWide ? scores.indexOf(Math.min(...scores)) : null;
  return {
    verdict: e.violationCount === 0 ? "fits" : e.violationCount === 1 ? "near" : "no",
    violations: namedViolations(e, names),
    people: e.people.map((p, i) => ({ ...p, name: names[i] })),
    minScore: e.minScore,
    meanScore: e.meanScore,
    balance: balanceLabel(e.spread),
    tag: profileTag(names, favoured, compromises),
    tradeoff: tradeoffLine(e, names, favoured, compromises),
  };
}
