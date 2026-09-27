/* Regenerates data/listings.json and data/commute.json from the hand-authored sources. */
import { writeFileSync } from "node:fs";
import path from "node:path";
import type { AmenityId, LifestyleId } from "../lib/data/catalog";
import type { Listing, Room } from "../lib/data/types";
import { buildCommute } from "./commute";
import { ROWS } from "./listings-src";

const AM: Record<string, AmenityId> = {
  C: "parking_car", T: "parking_2w", P: "pet_friendly", B: "balcony", G: "gated",
  U: "power_backup", W: "washing_machine", K: "modular_kitchen",
};
const LI: Record<string, LifestyleId> = {
  g: "guests_overnight", t: "no_timing", n: "nonveg", o: "owner_elsewhere",
  f: "women_friendly", q: "quiet_street", m: "near_groceries",
};

const BASE_DATE = new Date("2026-09-27T00:00:00Z");

function rooms(code: string, sqft: number, bhk: number): Room[] {
  const shares = [0.17, 0.14, 0.12];
  const names = bhk === 2 ? ["Master bedroom", "Bedroom 2", "Study"] : ["Master bedroom", "Bedroom 2", "Bedroom 3"];
  return code.split(" ").map((t, i) => ({
    name: names[i],
    sqft: Math.round((sqft * shares[i]) / 5) * 5,
    attachedBath: t.includes("b"),
    ac: t.includes("a"),
  }));
}

const listings: Listing[] = ROWS.map((r) => {
  const rs = rooms(r.rooms, r.sqft, r.bhk);
  const amenities = new Set<AmenityId>([...r.am].map((c) => AM[c]));
  // Structural amenities mirror the listing's physical facts.
  if (r.lift || r.floor <= 1) amenities.add("lift");
  if (rs.some((x) => x.attachedBath)) amenities.add("attached_bath");
  if (rs.some((x) => x.ac)) amenities.add("ac_room");
  if (r.furnishing === "full") amenities.add("fully_furnished");
  if (r.furnishing !== "unfurnished") amenities.add("semi_furnished");
  if (r.metro !== null && r.metro <= 15) amenities.add("near_metro");
  const d = new Date(BASE_DATE.getTime() + r.availIn * 86400000);
  return {
    id: r.id,
    title: r.title,
    areaId: r.area,
    society: r.society,
    address: `${r.society}, ${r.street}`,
    rentMonthly: r.rent,
    deposit: r.deposit,
    bhk: r.bhk,
    bathrooms: r.baths,
    carpetSqft: r.sqft,
    floor: r.floor,
    totalFloors: r.floors,
    hasLift: r.lift,
    furnishing: r.furnishing,
    amenities: [...amenities].sort(),
    lifestyle: [...r.life].map((c) => LI[c]),
    rooms: rs,
    metroWalkMinutes: r.metro,
    availableFrom: d.toISOString().slice(0, 10),
    description: r.desc,
    listedBy: r.by,
  };
});

const dir = path.join(__dirname, "..", "data");
writeFileSync(path.join(dir, "listings.json"), JSON.stringify(listings, null, 2) + "\n");
writeFileSync(path.join(dir, "commute.json"), JSON.stringify(buildCommute(), null, 2) + "\n");
console.log(`Wrote ${listings.length} listings and commute matrix.`);
