/**
 * Single source of truth for every user-facing label about areas, amenities,
 * lifestyle rules and anchor types. Edit copy here.
 */

export const AREAS = [
  { id: "baner", label: "Baner" },
  { id: "balewadi", label: "Balewadi" },
  { id: "aundh", label: "Aundh" },
  { id: "pashan", label: "Pashan" },
  { id: "bavdhan", label: "Bavdhan" },
  { id: "wakad", label: "Wakad" },
  { id: "hinjewadi", label: "Hinjewadi" },
  { id: "pimple_saudagar", label: "Pimple Saudagar" },
  { id: "kothrud", label: "Kothrud" },
  { id: "karve_nagar", label: "Karve Nagar" },
  { id: "deccan", label: "Deccan" },
  { id: "shivajinagar", label: "Shivajinagar" },
  { id: "koregaon_park", label: "Koregaon Park" },
  { id: "kalyani_nagar", label: "Kalyani Nagar" },
  { id: "viman_nagar", label: "Viman Nagar" },
  { id: "kharadi", label: "Kharadi" },
  { id: "hadapsar", label: "Hadapsar/Magarpatta" },
  { id: "wanowrie", label: "Wanowrie" },
] as const;

export type AreaId = (typeof AREAS)[number]["id"];
export const AREA_IDS = AREAS.map((a) => a.id) as [AreaId, ...AreaId[]];

export const AMENITIES = [
  { id: "lift", label: "Lift (or ground/1st floor)", short: "a lift", helper: "Ground or 1st floor counts too." },
  { id: "parking_car", label: "Covered parking — car", short: "covered car parking", helper: "A covered slot that's yours." },
  { id: "parking_2w", label: "Parking — two-wheeler", short: "two-wheeler parking", helper: "Somewhere safe for a scooter or bike." },
  { id: "attached_bath", label: "Attached bathroom for my room", short: "an attached bathroom", helper: "Your room has its own bathroom." },
  { id: "pet_friendly", label: "Pet-friendly", short: "pets allowed", helper: "Owner and society allow pets." },
  { id: "fully_furnished", label: "Fully furnished", short: "a fully furnished flat", helper: "Beds, sofa, fridge, the works." },
  { id: "semi_furnished", label: "Semi-furnished or better", short: "semi-furnishing", helper: "Wardrobes, fans, lights, kitchen basics." },
  { id: "balcony", label: "Balcony", short: "a balcony", helper: "Somewhere to stand outside." },
  { id: "gated", label: "Gated society / security", short: "a gated society", helper: "Guard at the gate, controlled entry." },
  { id: "power_backup", label: "Power backup", short: "power backup", helper: "Inverter or society DG backup." },
  { id: "washing_machine", label: "Washing machine", short: "a washing machine", helper: "Already in the flat." },
  { id: "ac_room", label: "Air conditioning in my room", short: "AC in her room", helper: "An AC in the room you'd get." },
  { id: "modular_kitchen", label: "Kitchen with modular fittings", short: "a modular kitchen", helper: "Cabinets, chimney, proper counters." },
  { id: "near_metro", label: "Near metro (≤15 min walk)", short: "a metro within 15 min walk", helper: "A station within a 15-minute walk." },
] as const;

export type AmenityId = (typeof AMENITIES)[number]["id"];
export const AMENITY_IDS = AMENITIES.map((a) => a.id) as [AmenityId, ...AmenityId[]];

export const LIFESTYLE = [
  { id: "guests_overnight", label: "Guests allowed overnight", short: "overnight guests", helper: "Friends and family can stay over." },
  { id: "no_timing", label: "No restrictions on timing", short: "no curfew", helper: "Come and go whenever you like." },
  { id: "nonveg", label: "Non-veg cooking allowed", short: "non-veg cooking", helper: "Owner is fine with non-veg in the kitchen." },
  { id: "owner_elsewhere", label: "Owner not living in the same building", short: "an owner who lives elsewhere", helper: "No landlord downstairs." },
  { id: "women_friendly", label: "Female-friendly / women-only society welcome", short: "a women-friendly society", helper: "Society is comfortable renting to three women." },
  { id: "quiet_street", label: "Quiet street", short: "a quiet street", helper: "Not on a main road." },
  { id: "near_groceries", label: "Close to groceries/market (≤10 min walk)", short: "groceries within 10 min walk", helper: "Kirana, veggies, a supermarket nearby." },
] as const;

export type LifestyleId = (typeof LIFESTYLE)[number]["id"];
export const LIFESTYLE_IDS = LIFESTYLE.map((a) => a.id) as [LifestyleId, ...LifestyleId[]];

export const ANCHOR_TYPES = [
  { id: "office", label: "Office" },
  { id: "college", label: "College" },
  { id: "gym", label: "Gym" },
  { id: "family", label: "Family" },
  { id: "partner", label: "Partner" },
  { id: "other", label: "Other" },
] as const;

export type AnchorType = (typeof ANCHOR_TYPES)[number]["id"];
export const ANCHOR_TYPE_IDS = ANCHOR_TYPES.map((a) => a.id) as [AnchorType, ...AnchorType[]];

export const COMMUTE_OPTIONS = [15, 20, 30, 45, 60] as const;

export const DEPOSIT_OPTIONS: { value: number | null; label: string }[] = [
  { value: 25000, label: "₹25k" },
  { value: 50000, label: "₹50k" },
  { value: 75000, label: "₹75k" },
  { value: 100000, label: "₹1L" },
  { value: null, label: "₹1.5L+ (no limit)" },
];

export const FLOOR_RULES = [
  { id: "low_only", label: "Ground / low floor only (0–2)" },
  { id: "lift_or_low", label: "Any floor with lift" },
  { id: "any", label: "Any floor" },
] as const;

export type FloorRule = (typeof FLOOR_RULES)[number]["id"];

export const FURNISHING_LABEL = { unfurnished: "Unfurnished", semi: "Semi-furnished", full: "Fully furnished" } as const;

const areaMap = new Map<string, string>(AREAS.map((a) => [a.id, a.label]));
const amenityMap = new Map<string, (typeof AMENITIES)[number]>(AMENITIES.map((a) => [a.id, a]));
const lifestyleMap = new Map<string, (typeof LIFESTYLE)[number]>(LIFESTYLE.map((a) => [a.id, a]));
const anchorMap = new Map<string, string>(ANCHOR_TYPES.map((a) => [a.id, a.label]));

export const areaLabel = (id: AreaId): string => areaMap.get(id) ?? id;
export const amenityLabel = (id: AmenityId): string => amenityMap.get(id)?.label ?? id;
export const amenityShort = (id: AmenityId): string => amenityMap.get(id)?.short ?? id;
export const lifestyleLabel = (id: LifestyleId): string => lifestyleMap.get(id)?.label ?? id;
export const lifestyleShort = (id: LifestyleId): string => lifestyleMap.get(id)?.short ?? id;
export const anchorTypeLabel = (id: AnchorType): string => anchorMap.get(id) ?? id;

export const formatRupees = (n: number): string => "₹" + Math.round(n).toLocaleString("en-IN");
export const formatRupeesShort = (n: number): string =>
  n >= 100000 ? `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L` : `₹${Math.round(n / 1000)}k`;
