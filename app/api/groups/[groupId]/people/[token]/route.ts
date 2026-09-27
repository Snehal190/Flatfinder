import { NextResponse } from "next/server";
import { getGroup, saveAnswers } from "@/lib/db/groups";
import { buildPersonView, findPerson } from "@/lib/group-view";
import { personAnswersSchema } from "@/lib/schema";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ groupId: string; token: string }> };

async function load(ctx: Ctx) {
  const { groupId, token } = await ctx.params;
  const g = await getGroup(groupId);
  const me = g ? findPerson(g, token) : undefined;
  return g && me ? { g, me } : null;
}

/** Returns only this person's own answers plus everyone's submitted/pending status. */
export async function GET(_req: Request, ctx: Ctx) {
  const found = await load(ctx);
  if (!found) return NextResponse.json({ error: "Link not found" }, { status: 404 });
  return NextResponse.json(buildPersonView(found.g, found.me), { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(req: Request, ctx: Ctx) {
  const found = await load(ctx);
  if (!found) return NextResponse.json({ error: "Link not found" }, { status: 404 });
  const body: unknown = await req.json().catch(() => null);
  const parsed = personAnswersSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid answers", issues: parsed.error.issues }, { status: 400 });
  }
  await saveAnswers(found.me.id, parsed.data);
  return NextResponse.json({ ok: true, savedAt: new Date().toISOString() });
}
