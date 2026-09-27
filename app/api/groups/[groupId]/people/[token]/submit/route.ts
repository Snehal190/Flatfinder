import { NextResponse } from "next/server";
import { getGroup, markSubmitted, saveAnswers } from "@/lib/db/groups";
import { buildPersonView, findPerson } from "@/lib/group-view";
import { personAnswersSchema } from "@/lib/schema";

export async function POST(req: Request, { params }: { params: Promise<{ groupId: string; token: string }> }) {
  const { groupId, token } = await params;
  const g = await getGroup(groupId);
  const me = g ? findPerson(g, token) : undefined;
  if (!g || !me) return NextResponse.json({ error: "Link not found" }, { status: 404 });
  const body: unknown = await req.json().catch(() => null);
  const parsed = personAnswersSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
  await saveAnswers(me.id, parsed.data);
  if (!me.submittedAt) await markSubmitted(me.id);
  const fresh = await getGroup(groupId);
  const freshMe = fresh ? findPerson(fresh, token) : undefined;
  return NextResponse.json(fresh && freshMe ? buildPersonView(fresh, freshMe) : { ok: true });
}
