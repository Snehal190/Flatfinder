import type { Listing } from "../data/types";
import type { PersonAnswers } from "../schema";
import { evaluatePerson } from "./evaluate";
import type { CommuteFn, PersonEvaluation, RoomAssignment } from "./types";

export const PERMUTATIONS_3: readonly (readonly [number, number, number])[] = [
  [0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0],
];

const caresAboutRoom = (a: PersonAnswers) =>
  a.amenities.attached_bath !== undefined || a.amenities.ac_room !== undefined;

function roomAt(listing: Listing, index: number): RoomAssignment | null {
  const r = listing.rooms[index];
  return r ? { index, name: r.name, attachedBath: r.attachedBath, ac: r.ac } : null;
}

interface Candidate {
  perm: readonly number[];
  evals: PersonEvaluation[];
  violations: number;
  min: number;
  mean: number;
}

/**
 * Tries every person→room permutation and keeps the one that breaks the fewest
 * must-haves, then maximises the minimum score, then the mean.
 */
export function allocateRooms(listing: Listing, people: PersonAnswers[], commute: CommuteFn): PersonEvaluation[] {
  const perms = people.some(caresAboutRoom) ? PERMUTATIONS_3 : [PERMUTATIONS_3[0]];
  let best: Candidate | null = null;
  for (const perm of perms) {
    const evals = people.map((a, i) => evaluatePerson(listing, a, roomAt(listing, perm[i]), commute));
    const scores = evals.map((e) => e.score);
    const c: Candidate = {
      perm,
      evals,
      violations: evals.reduce((n, e) => n + e.violations.length, 0),
      min: Math.min(...scores),
      mean: scores.reduce((x, y) => x + y, 0) / scores.length,
    };
    if (
      !best ||
      c.violations < best.violations ||
      (c.violations === best.violations && (c.min > best.min || (c.min === best.min && c.mean > best.mean)))
    ) {
      best = c;
    }
  }
  return (best as Candidate).evals;
}
