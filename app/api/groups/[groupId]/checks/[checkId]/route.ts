import { NextResponse } from "next/server";
import { deleteCheckedFlat, getGroup } from "@/lib/db/groups";

export async function DELETE(_req: Request, { params }: { params: Promise<{ groupId: string; checkId: string }> }) {
  const { groupId, checkId } = await params;
  const g = await getGroup(groupId);
  if (!g) return NextResponse.json({ error: "Group not found" }, { status: 404 });
  await deleteCheckedFlat(groupId, checkId);
  return NextResponse.json({ ok: true });
}
