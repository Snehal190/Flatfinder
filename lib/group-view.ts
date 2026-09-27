/**
 * Privacy rules live here. Nothing about another person's answers leaves the server
 * until all three have submitted.
 */
import { getCommute } from "./data/commute";
import { getListings } from "./data/listings";
import type { GroupRecord, PersonRecord } from "./db/groups";
import { factsToListing } from "./flat-facts";
import { checkFlat, computeResults, type FlatCheck, type GroupResults, type PersonInput } from "./matching";
import { DEFAULT_ANSWERS, flatFactsSchema, type FlatFacts, type PersonAnswers } from "./schema";

export interface CheckedFlatView {
  id: string;
  url: string | null;
  title: string;
  createdAt: string;
  facts: FlatFacts;
  result: FlatCheck;
}

export interface PersonStatus {
  name: string;
  position: number;
  submitted: boolean;
}

export interface GroupView {
  id: string;
  name: string | null;
  isDemo: boolean;
  people: PersonStatus[];
  submittedCount: number;
  allSubmitted: boolean;
  /** Present only once everyone has submitted. */
  unlocked: null | {
    updatedAt: string;
    results: GroupResults;
    editLinks: { name: string; href: string }[];
    checks: CheckedFlatView[];
  };
}

export interface PersonView {
  group: { id: string; name: string | null; isDemo: boolean; people: PersonStatus[]; allSubmitted: boolean };
  me: { name: string; position: number; answers: PersonAnswers; hasSaved: boolean; submittedAt: string | null };
}

const statuses = (g: GroupRecord): PersonStatus[] =>
  g.people.map((p) => ({ name: p.name, position: p.position, submitted: p.submittedAt !== null }));

const everyoneIn = (g: GroupRecord) => g.people.length === 3 && g.people.every((p) => p.submittedAt !== null);

export function buildGroupView(g: GroupRecord): GroupView {
  const allSubmitted = everyoneIn(g);
  const people = statuses(g);
  const base = {
    id: g.id,
    name: g.name,
    isDemo: g.isDemo,
    people,
    submittedCount: people.filter((p) => p.submitted).length,
    allSubmitted,
  };
  if (!allSubmitted) return { ...base, unlocked: null };

  const inputs = groupInputs(g);
  const updatedAt = new Date(Math.max(...g.people.map((p) => p.updatedAt.getTime()))).toISOString();
  return {
    ...base,
    unlocked: {
      updatedAt,
      results: computeResults(inputs, getListings(), getCommute),
      editLinks: g.people.map((p) => ({ name: p.name, href: `/g/${g.id}/p/${p.token}` })),
      checks: g.checks.flatMap((c) => {
        const view = buildCheckedFlatView(c, inputs);
        return view ? [view] : [];
      }),
    },
  };
}

export function findPerson(g: GroupRecord, token: string): PersonRecord | undefined {
  return g.people.find((p) => p.token === token);
}

export function buildPersonView(g: GroupRecord, me: PersonRecord): PersonView {
  return {
    group: { id: g.id, name: g.name, isDemo: g.isDemo, people: statuses(g), allSubmitted: everyoneIn(g) },
    me: {
      name: me.name,
      position: me.position,
      answers: me.answers ?? DEFAULT_ANSWERS,
      hasSaved: me.answers !== null,
      submittedAt: me.submittedAt?.toISOString() ?? null,
    },
  };
}

export function groupInputs(g: GroupRecord): PersonInput[] {
  return g.people.map((p) => ({ name: p.name, answers: p.answers ?? DEFAULT_ANSWERS }));
}

/** Re-evaluates a saved flat against the group's current answers (answers may have changed). */
export function buildCheckedFlatView(
  c: { id: string; url: string | null; title: string; facts: string; createdAt: Date },
  inputs: PersonInput[],
): CheckedFlatView | null {
  let raw: unknown;
  try {
    raw = JSON.parse(c.facts);
  } catch {
    return null;
  }
  const parsed = flatFactsSchema.safeParse(raw);
  if (!parsed.success) return null;
  return {
    id: c.id,
    url: c.url,
    title: c.title,
    createdAt: c.createdAt.toISOString(),
    facts: parsed.data,
    result: checkFlat(factsToListing(parsed.data, c.id), inputs, getCommute),
  };
}
