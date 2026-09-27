import type { AmenityId } from "../data/catalog";
import type { Listing, Room } from "../data/types";

export type RoomFeatures = Pick<Room, "attachedBath" | "ac">;

/** Whether a listing (and, for room-level features, her room) provides an amenity. */
export function hasAmenity(listing: Listing, id: AmenityId, room: RoomFeatures | null): boolean {
  switch (id) {
    case "lift":
      return listing.hasLift || listing.floor <= 1;
    case "attached_bath":
      return room ? room.attachedBath : listing.rooms.some((r) => r.attachedBath);
    case "ac_room":
      return room ? room.ac : listing.rooms.some((r) => r.ac);
    case "fully_furnished":
      return listing.furnishing === "full";
    case "semi_furnished":
      return listing.furnishing !== "unfurnished";
    case "near_metro":
      return listing.metroWalkMinutes !== null && listing.metroWalkMinutes <= 15;
    default:
      return listing.amenities.includes(id);
  }
}
