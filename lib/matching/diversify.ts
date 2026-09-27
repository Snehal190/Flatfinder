import type { ListingEvaluation } from "./types";

export function quality(e: ListingEvaluation): number {
  return (0.6 * e.minScore + 0.4 * e.meanScore) / 100;
}

export function cosine(a: number[], b: number[]): number {
  const dot = a.reduce((s, x, i) => s + x * b[i], 0);
  const na = Math.hypot(...a);
  const nb = Math.hypot(...b);
  if (na === 0 || nb === 0) return na === nb ? 1 : 0;
  return Math.max(0, dot / (na * nb));
}

/**
 * Scores are all positive, so raw cosine is ~1 for almost any pair. Centring each
 * vector compares the *shape* of the tradeoff (who is favoured) instead.
 */
const centred = (xs: number[]) => {
  const m = xs.reduce((s, x) => s + x, 0) / xs.length;
  return xs.map((x) => (Math.abs(x - m) < 1e-9 ? 0 : x - m));
};

export function similarity(a: ListingEvaluation, b: ListingEvaluation): number {
  const va = centred(a.people.map((p) => p.score));
  const vb = centred(b.people.map((p) => p.score));
  return 0.7 * cosine(va, vb) + (a.listing.areaId === b.listing.areaId ? 0.3 : 0);
}

/** Greedy Maximal Marginal Relevance: good options that differ from each other. */
export function selectDiverse(candidates: ListingEvaluation[], k = 3): ListingEvaluation[] {
  const pool = [...candidates];
  const picked: ListingEvaluation[] = [];
  if (pool.length === 0) return picked;
  pool.sort((a, b) => quality(b) - quality(a) || a.listing.id.localeCompare(b.listing.id));
  picked.push(pool.shift() as ListingEvaluation);
  while (picked.length < k && pool.length > 0) {
    let bestIdx = 0;
    let bestVal = -Infinity;
    pool.forEach((c, i) => {
      const maxSim = Math.max(...picked.map((p) => similarity(c, p)));
      const val = 0.7 * quality(c) - 0.3 * maxSim;
      if (val > bestVal) {
        bestVal = val;
        bestIdx = i;
      }
    });
    picked.push(pool.splice(bestIdx, 1)[0]);
  }
  return picked;
}
