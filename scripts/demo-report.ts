/* Prints what the engine produces for the demo scenario. `npx tsx scripts/demo-report.ts` */
import { getCommute } from "../lib/data/commute";
import { getListings } from "../lib/data/listings";
import { DEMO_ANSWERS, DEMO_NAMES } from "../lib/demo";
import { computeResults, evaluateListing } from "../lib/matching";

const people = DEMO_NAMES.map((name) => ({ name, answers: DEMO_ANSWERS[name] }));
const r = computeResults(people, getListings(), getCommute);
const evals = getListings().map((l) => evaluateListing(l, people.map((p) => p.answers), getCommute));
console.log("Eligible:", evals.filter((e) => e.violationCount === 0).map((e) => `${e.listing.id} [${e.people.map((p) => p.score).join(", ")}]`));
for (const o of r.options) {
  console.log(`\nOption ${o.letter} (${o.kind}) ${o.listing.id} ${o.listing.title}`);
  console.log(`  ${o.tag} | ${o.balance} | scores ${o.people.map((p) => `${p.name} ${p.score}`).join(", ")}`);
  console.log(`  ${o.tradeoff}`);
  console.log(`  rooms: ${o.people.map((p) => `${p.name}→${p.room?.name}`).join(", ")}`);
}
console.log("\nClose calls:");
for (const c of r.closeCalls) console.log(`  ${c.listing.id}: ${c.violation.personName} — ${c.violation.label}: ${c.violation.detail}`);
console.log("\nExclusions:");
for (const e of r.exclusions) console.log(`  ${e.count}  ${e.label}`);
