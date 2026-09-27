/* Builds data/commute.json: approximate weekday-peak minutes by car/two-wheeler. */
import { AREA_IDS, type AreaId } from "../lib/data/catalog";

// Rough locality centroids.
const COORDS: Record<AreaId, [number, number]> = {
  baner: [18.559, 73.787], balewadi: [18.576, 73.779], aundh: [18.558, 73.807],
  pashan: [18.537, 73.795], bavdhan: [18.515, 73.781], wakad: [18.599, 73.763],
  hinjewadi: [18.591, 73.738], pimple_saudagar: [18.598, 73.797], kothrud: [18.507, 73.807],
  karve_nagar: [18.489, 73.821], deccan: [18.517, 73.841], shivajinagar: [18.531, 73.847],
  koregaon_park: [18.536, 73.894], kalyani_nagar: [18.548, 73.902], viman_nagar: [18.567, 73.914],
  kharadi: [18.551, 73.935], hadapsar: [18.512, 73.926], wanowrie: [18.487, 73.898],
};

// Hand-checked pairs that the straight-line model gets wrong (river crossings, IT-park jams, Sus Road shortcut).
const OVERRIDES: [AreaId, AreaId, number][] = [
  ["baner", "hinjewadi", 35],
  ["balewadi", "hinjewadi", 25],
  ["wakad", "hinjewadi", 20],
  ["pashan", "hinjewadi", 30],
  ["bavdhan", "hinjewadi", 35],
  ["pimple_saudagar", "hinjewadi", 30],
  ["aundh", "hinjewadi", 40],
  ["aundh", "baner", 15],
  ["aundh", "balewadi", 20],
  ["aundh", "pashan", 15],
  ["aundh", "wakad", 20],
  ["aundh", "pimple_saudagar", 20],
  ["aundh", "bavdhan", 25],
  ["aundh", "kothrud", 30],
  ["kothrud", "viman_nagar", 50],
  ["pimple_saudagar", "shivajinagar", 30],
  ["aundh", "shivajinagar", 20],
];

export function buildCommute(): Record<AreaId, Record<AreaId, number>> {
  const out = {} as Record<AreaId, Record<AreaId, number>>;
  for (const a of AREA_IDS) {
    out[a] = {} as Record<AreaId, number>;
    for (const b of AREA_IDS) {
      if (a === b) { out[a][b] = 10; continue; }
      const [la, lo] = COORDS[a];
      const [lb, lob] = COORDS[b];
      const km = Math.hypot((la - lb) * 111, (lo - lob) * 105.6) * 1.35;
      let min = 8 + km * 2.4;
      if (a === "hinjewadi" || b === "hinjewadi") min += 5;
      out[a][b] = Math.round(min / 5) * 5;
    }
  }
  for (const [a, b, m] of OVERRIDES) { out[a][b] = m; out[b][a] = m; }
  return out;
}
