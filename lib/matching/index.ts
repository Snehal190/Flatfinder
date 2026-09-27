import type { Listing } from "../data/types";
import { selectDiverse } from "./diversify";
import { evaluateListing, nearMisses, rankEligible } from "./rank";
import {
  balanceLabel, closeCalls, exclusionSummary, mustHaveList, namedViolations, profileTag, tradeoffLine, tradeoffProfile,
} from "./summary";
import type { CommuteFn, GroupResults, ListingEvaluation, OptionResult, PersonInput } from "./types";

export * from "./types";
export { evaluatePerson } from "./evaluate";
export { hasAmenity } from "./features";
export { commuteCredit, underBudgetCredit, scorePerson } from "./score";
export { allocateRooms } from "./rooms";
export { evaluateListing, rankEligible, nearMisses, compareFairness } from "./rank";
export { selectDiverse, similarity, quality, cosine } from "./diversify";
export { balanceLabel, exclusionSummary, tradeoffProfile } from "./summary";

const LETTERS = ["A", "B", "C"] as const;

export function computeResults(people: PersonInput[], listings: Listing[], commute: CommuteFn): GroupResults {
  const names = people.map((p) => p.name);
  const answers = people.map((p) => p.answers);
  const evals = listings.map((l) => evaluateListing(l, answers, commute));
  const eligible = rankEligible(evals);

  const picks: ListingEvaluation[] = selectDiverse(eligible, 3);
  const nearMissPicks: ListingEvaluation[] = [];
  for (const n of [1, 2]) {
    if (picks.length + nearMissPicks.length >= 3) break;
    nearMissPicks.push(...nearMisses(evals, n).slice(0, 3 - picks.length - nearMissPicks.length));
  }

  // Baseline for "who does this favour": each person's mean score across the options' pool.
  const pool = eligible.length >= 2 ? eligible : [...picks, ...nearMissPicks];
  const baselines = names.map((_, i) =>
    pool.length ? pool.reduce((s, e) => s + e.people[i].score, 0) / pool.length : 0,
  );

  const toOption = (e: ListingEvaluation, idx: number, kind: OptionResult["kind"]): OptionResult => {
    const { favoured, compromises } = tradeoffProfile(e, baselines);
    return {
      letter: LETTERS[idx],
      kind,
      listing: e.listing,
      people: e.people.map((p, i) => ({ ...p, name: names[i] })),
      minScore: e.minScore,
      meanScore: e.meanScore,
      spread: e.spread,
      balance: balanceLabel(e.spread),
      favoured,
      compromises,
      tag: profileTag(names, favoured, compromises),
      tradeoff: tradeoffLine(e, names, favoured, compromises),
      violations: namedViolations(e, names),
    };
  };

  const options = [
    ...picks.map((e, i) => toOption(e, i, "eligible")),
    ...nearMissPicks.map((e, i) => toOption(e, picks.length + i, "near_miss")),
  ];

  return {
    options,
    eligibleCount: eligible.length,
    totalListings: listings.length,
    excludedCount: listings.length - eligible.length,
    exclusions: exclusionSummary(evals, people),
    closeCalls: closeCalls(evals, names),
    mustHaves: people.map((p) => ({ name: p.name, items: mustHaveList(p) })),
  };
}
