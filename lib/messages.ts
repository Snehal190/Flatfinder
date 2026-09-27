import { FURNISHING_LABEL, areaLabel, formatRupees } from "./data/catalog";
import type { OptionResult } from "./matching/types";

export const personInviteMessage = (name: string, url: string) =>
  `Hi ${name}, fill this in on your own, don't peek at anyone else's 🙂 → ${url}`;

export const resultsInviteMessage = (url: string) =>
  `Flat hunt 🏠 Once all three of us have filled in our forms, the options show up here → ${url}`;

/** Plain-text summary of one option, for pasting into WhatsApp. */
export function optionSummary(o: OptionResult): string {
  const l = o.listing;
  const lines = [
    `*Option ${o.letter}: ${l.title}*`,
    `${areaLabel(l.areaId)} · ${l.society}`,
    `Rent ${formatRupees(l.rentMonthly)} → ${formatRupees(l.rentMonthly / 3)} each · Deposit ${formatRupees(l.deposit)}`,
    `${l.bathrooms} bathrooms · Floor ${l.floor}/${l.totalFloors}${l.hasLift ? " (lift)" : " (no lift)"} · ${FURNISHING_LABEL[l.furnishing]}`,
  ];
  if (o.kind === "near_miss") {
    for (const v of o.violations) lines.push(`⚠ Breaks ${v.personName}'s must-have: ${v.label} (${v.detail})`);
  }
  lines.push("", `_${o.tradeoff}_`, "");
  for (const p of o.people) {
    lines.push(`*${p.name}* (${Math.round(p.score)}% of her wishlist)${p.room ? ` · ${p.room.name}` : ""}`);
    if (p.met.length) lines.push(`  ✓ ${p.met.slice(0, 5).map((m) => m.label).join(", ")}`);
    if (p.missed.length) lines.push(`  ⚠ Gives up: ${p.missed.slice(0, 5).map((m) => m.label).join(", ")}`);
  }
  return lines.join("\n");
}
