import { NextResponse } from "next/server";
import { addCheckedFlat, getGroup } from "@/lib/db/groups";
import { buildCheckedFlatView, groupInputs } from "@/lib/group-view";
import { flatFactsSchema } from "@/lib/schema";

/** Check a flat found online against everyone's answers. Only works once all three have submitted. */
export async function POST(req: Request, { params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const g = await getGroup(groupId);
  if (!g) return NextResponse.json({ error: "Group not found" }, { status: 404 });
  if (!g.people.every((p) => p.submittedAt)) {
    return NextResponse.json({ error: "Checking flats unlocks once all three have submitted." }, { status: 403 });
  }
  const body: unknown = await req.json().catch(() => null);
  const parsed = flatFactsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the details", issues: parsed.error.issues }, { status: 400 });
  }
  const facts = parsed.data;
  const rec = await addCheckedFlat(groupId, { url: facts.url || null, title: facts.title, facts: JSON.stringify(facts) });
  return NextResponse.json(buildCheckedFlatView(rec, groupInputs(g)));
}
