import type { AreaId } from "../data/catalog";
import type { Listing, Room } from "../data/types";
import type { Anchor, PersonAnswers } from "../schema";

export type RuleKind = "rent" | "deposit" | "area" | "anchor" | "floor" | "amenity" | "lifestyle" | "bathrooms";

export interface Violation {
  /** Stable key, e.g. "anchor:0", "amenity:parking_2w". */
  rule: string;
  kind: RuleKind;
  label: string;
  detail: string;
  /** 0–1: how badly the rule is broken. */
  severity: number;
}

export interface Met {
  rule: string;
  label: string;
}

export interface Missed {
  rule: string;
  label: string;
  detail: string;
}

export interface CommuteResult {
  anchor: Anchor;
  minutes: number;
  withinLimit: boolean;
}

export interface RoomAssignment {
  index: number;
  name: string;
  attachedBath: boolean;
  ac: boolean;
}

export interface PersonEvaluation {
  violations: Violation[];
  met: Met[];
  missed: Missed[];
  commutes: CommuteResult[];
  rentShare: number;
  depositShare: number;
  /** Rent share as a percentage of her max. */
  rentShareVsMax: number;
  score: number;
  room: RoomAssignment | null;
}

export interface PersonInput {
  name: string;
  answers: PersonAnswers;
}

export type CommuteFn = (from: AreaId, to: AreaId) => number;

export interface ListingEvaluation {
  listing: Listing;
  people: PersonEvaluation[];
  violationCount: number;
  severity: number;
  minScore: number;
  meanScore: number;
  spread: number;
}

export type BalanceLabel = "Evenly shared compromise" | "Somewhat uneven" | "One person carries most of it";

export interface NamedViolation extends Violation {
  personIndex: number;
  personName: string;
}

export interface OptionResult {
  letter: "A" | "B" | "C";
  kind: "eligible" | "near_miss";
  listing: Listing;
  people: (PersonEvaluation & { name: string })[];
  minScore: number;
  meanScore: number;
  spread: number;
  balance: BalanceLabel;
  favoured: number | null;
  compromises: number | null;
  tag: string;
  tradeoff: string;
  violations: NamedViolation[];
}

export interface ExclusionCategory {
  key: string;
  label: string;
  personName: string;
  count: number;
  listings: { id: string; title: string }[];
}

export interface CloseCall {
  listing: { id: string; title: string; areaId: AreaId };
  violation: NamedViolation;
}

export interface GroupResults {
  options: OptionResult[];
  eligibleCount: number;
  totalListings: number;
  excludedCount: number;
  exclusions: ExclusionCategory[];
  closeCalls: CloseCall[];
  mustHaves: { name: string; items: string[] }[];
}

export type { Room };
