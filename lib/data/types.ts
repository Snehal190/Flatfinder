import type { AmenityId, AreaId, LifestyleId } from "./catalog";

export type Furnishing = "unfurnished" | "semi" | "full";

export interface Room {
  name: string;
  sqft: number;
  attachedBath: boolean;
  ac: boolean;
}

export interface Listing {
  id: string;
  title: string;
  areaId: AreaId;
  society: string;
  address: string;
  rentMonthly: number;
  deposit: number;
  bhk: number;
  bathrooms: number;
  carpetSqft: number;
  floor: number;
  totalFloors: number;
  hasLift: boolean;
  furnishing: Furnishing;
  amenities: AmenityId[];
  lifestyle: LifestyleId[];
  rooms: Room[];
  metroWalkMinutes: number | null;
  availableFrom: string;
  description: string;
  listedBy: "owner" | "broker";
}

export type CommuteMatrix = Record<AreaId, Record<AreaId, number>>;
