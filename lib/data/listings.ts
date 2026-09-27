import raw from "@/data/listings.json";
import type { Listing } from "./types";

/**
 * Listing source. Swap this implementation for a real feed (API, CSV import, DB table)
 * as long as it returns the same `Listing` shape.
 */
const LISTINGS = raw as Listing[];

export function getListings(): Listing[] {
  return LISTINGS;
}

export function getListing(id: string): Listing | undefined {
  return LISTINGS.find((l) => l.id === id);
}
