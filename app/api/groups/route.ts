import { NextResponse } from "next/server";
import { createGroup } from "@/lib/db/groups";
import { createGroupSchema } from "@/lib/schema";

export async function POST(req: Request) {
  const body: unknown = await req.json().catch(() => null);
  const parsed = createGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please give all three people a name." }, { status: 400 });
  }
  const g = await createGroup({ names: parsed.data.names, groupName: parsed.data.groupName });
  // Tokens are returned exactly once, to the person creating the group, so they can share them.
  return NextResponse.json({
    groupId: g.id,
    groupName: g.name,
    people: g.people.map((p) => ({ name: p.name, token: p.token })),
  });
}
