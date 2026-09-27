import raw from "@/data/commute.json";
import type { AreaId } from "./catalog";
import type { CommuteMatrix } from "./types";

/** Symmetric weekday-peak travel times in minutes. Replace with a routing API later if needed. */
const MATRIX = raw as CommuteMatrix;

export function getCommute(from: AreaId, to: AreaId): number {
  return MATRIX[from]?.[to] ?? MATRIX[to]?.[from] ?? 60;
}

export function getCommuteMatrix(): CommuteMatrix {
  return MATRIX;
}
