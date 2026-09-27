import type { PersonAnswers } from "./schema";

/** Scenario-accurate answers for the Riya / Meera / Kavita demo. */
export const DEMO_ANSWERS: Record<"Riya" | "Meera" | "Kavita", PersonAnswers> = {
  Riya: {
    maxRent: 22000,
    maxDeposit: 75000,
    preferUnderBudget: false,
    areas: { aundh: "prefer", baner: "prefer", pashan: "prefer", hadapsar: "exclude", wanowrie: "exclude" },
    anchors: [
      { type: "gym", areaId: "aundh", maxMinutes: 20, strictness: "must" },
      { type: "family", areaId: "aundh", maxMinutes: 20, strictness: "must" },
    ],
    amenities: { balcony: "nice", gated: "nice", fully_furnished: "nice", near_metro: "nice" },
    minBathrooms: null,
    floorRule: "any",
    lifestyle: { guests_overnight: "nice" },
  },
  Meera: {
    maxRent: 18000,
    maxDeposit: 50000,
    preferUnderBudget: true,
    areas: { kharadi: "exclude" },
    anchors: [{ type: "office", areaId: "shivajinagar", maxMinutes: 30, strictness: "nice" }],
    amenities: { lift: "must", attached_bath: "nice", power_backup: "nice" },
    minBathrooms: null,
    floorRule: "lift_or_low",
    lifestyle: { quiet_street: "nice", near_groceries: "nice" },
  },
  Kavita: {
    maxRent: 20000,
    maxDeposit: 75000,
    preferUnderBudget: false,
    areas: { wakad: "prefer", balewadi: "prefer", baner: "prefer" },
    anchors: [
      { type: "office", areaId: "hinjewadi", maxMinutes: 30, strictness: "must" },
      { type: "partner", areaId: "viman_nagar", maxMinutes: 45, strictness: "nice" },
    ],
    amenities: { parking_2w: "must", pet_friendly: "nice", washing_machine: "nice", ac_room: "nice" },
    minBathrooms: null,
    floorRule: "any",
    lifestyle: { nonveg: "nice", no_timing: "nice" },
  },
};

export const DEMO_NAMES = ["Riya", "Meera", "Kavita"] as const;
