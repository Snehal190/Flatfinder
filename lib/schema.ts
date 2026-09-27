import { z } from "zod";
import { AMENITY_IDS, ANCHOR_TYPE_IDS, AREA_IDS, LIFESTYLE_IDS } from "./data/catalog";

export const strictness = z.enum(["must", "nice"]);
export type Strictness = z.infer<typeof strictness>;

const areaId = z.enum(AREA_IDS);
const amenityId = z.enum(AMENITY_IDS);
const lifestyleId = z.enum(LIFESTYLE_IDS);

export const anchorSchema = z.object({
  type: z.enum(ANCHOR_TYPE_IDS),
  areaId,
  maxMinutes: z.union([z.literal(15), z.literal(20), z.literal(30), z.literal(45), z.literal(60)]),
  strictness,
});
export type Anchor = z.infer<typeof anchorSchema>;

export const personAnswersSchema = z.object({
  maxRent: z.number().int().min(8000).max(35000).multipleOf(500),
  maxDeposit: z.number().int().positive().nullable(),
  preferUnderBudget: z.boolean(),
  areas: z.record(areaId, z.enum(["prefer", "exclude"])),
  anchors: z.array(anchorSchema).max(3),
  amenities: z.record(amenityId, strictness),
  minBathrooms: z.object({ value: z.union([z.literal(2), z.literal(3)]), strictness }).nullable(),
  floorRule: z.enum(["low_only", "lift_or_low", "any"]),
  lifestyle: z.record(lifestyleId, strictness),
});
export type PersonAnswers = z.infer<typeof personAnswersSchema>;

export const DEFAULT_ANSWERS: PersonAnswers = {
  maxRent: 18000,
  maxDeposit: 50000,
  preferUnderBudget: false,
  areas: {},
  anchors: [],
  amenities: {},
  minBathrooms: null,
  floorRule: "any",
  lifestyle: {},
};

export const createGroupSchema = z.object({
  groupName: z.string().trim().max(60).optional(),
  names: z.array(z.string().trim().min(1).max(30)).length(3),
});
