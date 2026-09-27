import { prisma } from "../lib/db/client";
import { resetDemoGroup } from "../lib/demo-group";

async function main() {
  const g = await resetDemoGroup();
  console.log(`Seeded demo group "${g.name}" → /g/${g.id}`);
  for (const p of g.people) console.log(`  ${p.name}: /g/${g.id}/p/${p.token}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
