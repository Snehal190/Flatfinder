import { NextResponse } from "next/server";
import { getGroup } from "@/lib/db/groups";
import { buildGroupView } from "@/lib/group-view";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const g = await getGroup(groupId);
  if (!g) return NextResponse.json({ error: "Group not found" }, { status: 404 });
  return NextResponse.json(buildGroupView(g), { headers: { "Cache-Control": "no-store" } });
}
