/**
 * Reads what we can about a flat from (a) its listing URL and (b) listing text the user pasted.
 * Nothing is fetched: listing sites block automated access, so we only use what the user gives us.
 */
import { AREAS, type AmenityId, type AreaId, type LifestyleId } from "./data/catalog";
import type { Furnishing } from "./data/types";

export interface ParsedFlat {
  site?: string;
  title?: string;
  areaId?: AreaId;
  bhk?: number;
  carpetSqft?: number;
  rentMonthly?: number;
  deposit?: number;
  bathrooms?: number;
  floor?: number;
  totalFloors?: number;
  hasLift?: boolean;
  furnishing?: Furnishing;
  amenities: AmenityId[];
  lifestyle: LifestyleId[];
  /** Things we found and explicitly ruled out, e.g. "no pets". */
  notAllowed: (AmenityId | LifestyleId)[];
}

const SITES: [RegExp, string][] = [
  [/99acres\./, "99acres"],
  [/housing\.com/, "Housing.com"],
  [/magicbricks\./, "MagicBricks"],
  [/nobroker\./, "NoBroker"],
  [/squareyards\./, "Square Yards"],
  [/commonfloor\./, "CommonFloor"],
  [/makaan\./, "Makaan"],
  [/facebook\.|fb\.com/, "Facebook"],
];

/** Extra spellings people and sites use for each locality. */
const AREA_ALIASES: Partial<Record<AreaId, string[]>> = {
  hadapsar: ["hadapsar", "magarpatta"],
  pimple_saudagar: ["pimple saudagar", "pimple saudager"],
  koregaon_park: ["koregaon park", "kp annexe"],
  hinjewadi: ["hinjewadi", "hinjawadi", "hinjewadi phase"],
  kalyani_nagar: ["kalyani nagar", "kalyaninagar"],
  viman_nagar: ["viman nagar", "vimannagar"],
  karve_nagar: ["karve nagar", "karvenagar"],
  shivajinagar: ["shivajinagar", "shivaji nagar", "model colony"],
  deccan: ["deccan", "deccan gymkhana", "prabhat road", "fc road"],
  balewadi: ["balewadi"],
  baner: ["baner"],
};

function normalise(s: string): string {
  return ` ${s.toLowerCase().replace(/[^a-z0-9₹.,/]+/g, " ").replace(/\s+/g, " ")} `;
}

export function findArea(text: string): AreaId | undefined {
  const t = normalise(text);
  // Longer names first so "Balewadi" isn't read as "Baner"-adjacent noise and multi-word names win.
  const candidates = AREAS.flatMap((a) =>
    (AREA_ALIASES[a.id] ?? [a.label.toLowerCase()]).map((alias) => ({ id: a.id, alias })),
  ).sort((x, y) => y.alias.length - x.alias.length);
  let best: { id: AreaId; at: number } | undefined;
  for (const c of candidates) {
    const at = t.indexOf(` ${c.alias} `);
    if (at >= 0 && (!best || at < best.at)) best = { id: c.id, at };
  }
  return best?.id;
}

/** "45,000" → 45000 · "45k" → 45000 · "1.5 lac" → 150000 */
export function parseAmount(num: string, unit = ""): number | undefined {
  const n = Number(num.replace(/,/g, ""));
  if (!Number.isFinite(n) || n <= 0) return undefined;
  const u = unit.toLowerCase();
  if (/^(l|lac|lacs|lakh|lakhs)$/.test(u)) return Math.round(n * 100000);
  if (/^(k|thousand)$/.test(u)) return Math.round(n * 1000);
  return Math.round(n);
}

const AMOUNT = String.raw`(?:₹|rs\.?|inr)?\s*([\d][\d,]*(?:\.\d+)?)\s*(k|thousand|l|lac|lacs|lakh|lakhs)?\b`;

function parseUrl(url: string, out: ParsedFlat) {
  let u: URL;
  try {
    u = new URL(url.trim());
  } catch {
    return;
  }
  const host = u.hostname.toLowerCase();
  out.site = SITES.find(([re]) => re.test(host))?.[1] ?? host.replace(/^www\./, "");
  const slug = decodeURIComponent(u.pathname + " " + u.search).replace(/[-_/+=&?]+/g, " ").toLowerCase();

  const bhk = slug.match(/\b(\d)\s*bhk\b/);
  if (bhk) out.bhk = Number(bhk[1]);
  const sqft = slug.match(/\b(\d{3,5})\s*sq\s*\.?\s*ft\b/);
  if (sqft) out.carpetSqft = Number(sqft[1]);
  const rent = slug.match(/\bfor rs\.?\s*(\d{4,6})\b/) ?? slug.match(/\brent\s*(\d{4,6})\b/);
  if (rent) out.rentMonthly = Number(rent[1]);
  if (/\bsemi furnished\b/.test(slug)) out.furnishing = "semi";
  else if (/\bunfurnished\b/.test(slug)) out.furnishing = "unfurnished";
  else if (/\b(fully )?furnished\b/.test(slug)) out.furnishing = "full";
  out.areaId = findArea(slug);
}

interface Keyword {
  id: AmenityId | LifestyleId;
  kind: "amenity" | "lifestyle";
  re: RegExp;
}

const KEYWORDS: Keyword[] = [
  { id: "parking_car", kind: "amenity", re: /\b(car parking|covered parking|4 wheeler parking|four wheeler parking|reserved parking)\b/ },
  { id: "parking_2w", kind: "amenity", re: /\b(two wheeler parking|2 wheeler parking|bike parking|two wheeler|2 wheeler|scooter parking)\b/ },
  { id: "pet_friendly", kind: "amenity", re: /\b(pet friendly|pets allowed|pets? welcome|pets)\b/ },
  { id: "balcony", kind: "amenity", re: /\bbalcon(y|ies)\b/ },
  { id: "gated", kind: "amenity", re: /\b(gated|24 ?x ?7 security|24 7 security|security guard|cctv|security)\b/ },
  { id: "power_backup", kind: "amenity", re: /\b(power backup|dg backup|inverter|full backup|power back up)\b/ },
  { id: "washing_machine", kind: "amenity", re: /\bwashing machine\b/ },
  { id: "modular_kitchen", kind: "amenity", re: /\bmodular kitchen\b/ },
  { id: "nonveg", kind: "lifestyle", re: /\b(non veg|nonveg|non vegetarian)\b/ },
  { id: "guests_overnight", kind: "lifestyle", re: /\b(guests allowed|visitors allowed|guests)\b/ },
  { id: "no_timing", kind: "lifestyle", re: /\b(no restrictions?|no curfew|no timing|no time restriction)\b/ },
  { id: "women_friendly", kind: "lifestyle", re: /\b(girls|women|ladies|female|working women)\b/ },
  { id: "owner_elsewhere", kind: "lifestyle", re: /\b(owner (lives|staying) (abroad|elsewhere|in another city|outside)|nri owner)\b/ },
  { id: "quiet_street", kind: "lifestyle", re: /\b(quiet|peaceful|calm) (lane|street|area|locality|neighbou?rhood)\b/ },
  { id: "near_groceries", kind: "lifestyle", re: /\b(supermarket|grocery|groceries|d mart|dmart|vegetable market|market nearby|kirana)\b/ },
];

const NEGATION = /\b(no|not|without|non|never|strictly no)\s+(\w+\s+){0,2}$/;
const VEG_ONLY = /\b(veg only|vegetarians? only|only veg|pure veg|no non veg)\b/;

/** Is the match at `at` preceded (within a few words) by a negation? */
function negated(text: string, at: number, id: string): boolean {
  if (id === "nonveg") return false; // "non veg" is itself the keyword; veg-only is handled separately
  if (id === "no_timing") return false;
  return NEGATION.test(text.slice(Math.max(0, at - 20), at));
}

function parseText(raw: string, out: ParsedFlat) {
  const t = normalise(raw);

  const bhk = t.match(/\b(\d)\s*bhk\b/);
  if (bhk && out.bhk === undefined) out.bhk = Number(bhk[1]);
  const sqft = t.match(/\b(\d{3,5})\s*(sq\s*\.?\s*ft|sqft|square feet)\b/);
  if (sqft && out.carpetSqft === undefined) out.carpetSqft = Number(sqft[1]);

  const deposit = t.match(new RegExp(String.raw`\b(deposit|security deposit)\b[^0-9₹]{0,20}` + AMOUNT));
  if (deposit) out.deposit = parseAmount(deposit[2], deposit[3]);
  const rentBefore = t.match(new RegExp(String.raw`\b(rent|rental|monthly)\b[^0-9₹]{0,20}` + AMOUNT));
  const rentAfter = t.match(new RegExp(AMOUNT + String.raw`\s*(/|per|a)\s*(month|mo|pm)\b`));
  const rent = rentBefore ? parseAmount(rentBefore[2], rentBefore[3]) : rentAfter ? parseAmount(rentAfter[1], rentAfter[2]) : undefined;
  if (rent && rent >= 5000 && rent <= 500000) out.rentMonthly = rent;

  const baths = t.match(/\b(\d)\s*(bath|baths|bathroom|bathrooms|washroom|washrooms|toilet|toilets)\b/);
  if (baths) out.bathrooms = Number(baths[1]);

  if (/\bground floor\b/.test(t)) out.floor = 0;
  const floorOf =
    t.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s*(?:floor\s*)?(?:out of|of|\/)\s*(\d{1,2})\s*(?:floors?)?\b/) ??
    t.match(/\bfloor\s*(\d{1,2})\s*(?:out of|of|\/)\s*(\d{1,2})\b/);
  if (floorOf && Number(floorOf[1]) <= Number(floorOf[2])) {
    out.floor = Number(floorOf[1]);
    out.totalFloors = Number(floorOf[2]);
  } else {
    const floor = t.match(/\b(\d{1,2})(?:st|nd|rd|th)\s*floor\b/);
    if (floor) out.floor = Number(floor[1]);
  }

  const lift = t.match(/\b(lift|lifts|elevator|elevators)\b/);
  if (lift?.index !== undefined) out.hasLift = !NEGATION.test(t.slice(Math.max(0, lift.index - 20), lift.index));

  if (/\bsemi furnished\b/.test(t)) out.furnishing = "semi";
  else if (/\bunfurnished\b/.test(t)) out.furnishing = "unfurnished";
  else if (/\b(fully furnished|furnished)\b/.test(t)) out.furnishing ??= "full";

  for (const k of KEYWORDS) {
    const m = k.re.exec(t);
    if (!m || m.index === undefined) continue;
    const bucket = negated(t, m.index, k.id) ? out.notAllowed : k.kind === "amenity" ? out.amenities : out.lifestyle;
    if (!bucket.includes(k.id as never)) (bucket as string[]).push(k.id);
  }
  if (VEG_ONLY.test(t)) {
    out.lifestyle = out.lifestyle.filter((x) => x !== "nonveg");
    if (!out.notAllowed.includes("nonveg")) out.notAllowed.push("nonveg");
  }
  // "Pets" alone next to "no" is caught above; plain "pets" mention without negation counts as allowed.
  out.areaId ??= findArea(t);
}

export function parseListing(url: string, text: string): ParsedFlat {
  const out: ParsedFlat = { amenities: [], lifestyle: [], notAllowed: [] };
  if (url.trim()) parseUrl(url, out);
  if (text.trim()) parseText(text, out);
  if (out.bhk || out.areaId) {
    const area = out.areaId ? AREAS.find((a) => a.id === out.areaId)?.label : undefined;
    out.title = [out.bhk ? `${out.bhk}BHK` : "Flat", area ? `in ${area}` : "", out.site ? `(${out.site})` : ""].filter(Boolean).join(" ");
  }
  return out;
}
