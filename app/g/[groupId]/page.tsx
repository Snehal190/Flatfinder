import { notFound } from "next/navigation";
import { GroupPage } from "@/components/results/GroupPage";
import { getGroup } from "@/lib/db/groups";
import { buildGroupView } from "@/lib/group-view";

export const dynamic = "force-dynamic";

export default async function GroupRoute({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const g = await getGroup(groupId);
  if (!g) notFound();
  return <GroupPage initial={buildGroupView(g)} />;
}

export const metadata = { title: "Your options · Common Ground", robots: { index: false } };
