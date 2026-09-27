import type { AmenityId } from "./data/catalog";
import type { Listing, Room } from "./data/types";
import type { FlatFacts } from "./schema";

/** Turns what someone entered about a flat they found into a `Listing` the engine can evaluate. */
export function factsToListing(f: FlatFacts, id: string): Listing {
  const names = f.bhk <= 2 ? ["Bedroom 1", "Bedroom 2", "Study / third room"] : ["Bedroom 1", "Bedroom 2", "Bedroom 3"];
  const rooms: Room[] = names.map((name, i) => ({
    name,
    sqft: 0,
    attachedBath: i < f.attachedBaths,
    ac: i < f.acRooms,
  }));
  const metroWalkMinutes = f.metro === "near" ? 10 : f.metro === "far" ? 25 : null;
  const amenities = new Set<AmenityId>(f.amenities);
  if (f.hasLift || f.floor <= 1) amenities.add("lift");
  if (f.attachedBaths > 0) amenities.add("attached_bath");
  if (f.acRooms > 0) amenities.add("ac_room");
  if (f.furnishing === "full") amenities.add("fully_furnished");
  if (f.furnishing !== "unfurnished") amenities.add("semi_furnished");
  if (f.metro === "near") amenities.add("near_metro");
  return {
    id,
    title: f.title,
    areaId: f.areaId,
    society: "",
    address: "",
    rentMonthly: f.rentMonthly,
    deposit: f.deposit,
    bhk: f.bhk,
    bathrooms: f.bathrooms,
    carpetSqft: 0,
    floor: f.floor,
    totalFloors: f.totalFloors,
    hasLift: f.hasLift,
    furnishing: f.furnishing,
    amenities: [...amenities],
    lifestyle: f.lifestyle,
    rooms,
    metroWalkMinutes,
    availableFrom: "",
    description: "",
    listedBy: "owner",
  };
}
