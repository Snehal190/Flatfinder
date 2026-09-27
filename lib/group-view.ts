/**
 * Privacy rules live here. Nothing about another person's answers leaves the server
 * until all three have submitted.
 */
import { getCommute } from "./data/commute";
import { getListings } from "./data/listings";
import type { GroupRecord, PersonRecord } from "./db/groups";
import { computeResults, type GroupResults } from "./matching";
import { DEFAULT_ANSWERS, type PersonAnswers } from "./schema";

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

  const inputs = g.people.map((p) => ({ name: p.name, answers: p.answers ?? DEFAULT_ANSWERS }));
  const updatedAt = new Date(Math.max(...g.people.map((p) => p.updatedAt.getTime()))).toISOString();
  return {
    ...base,
    unlocked: {
      updatedAt,
      results: computeResults(inputs, getListings(), getCommute),
      editLinks: g.people.map((p) => ({ name: p.name, href: `/g/${g.id}/p/${p.token}` })),
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
