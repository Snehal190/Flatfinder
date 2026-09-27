import { notFound } from "next/navigation";
import { Questionnaire } from "@/components/form/Questionnaire";
import { getGroup } from "@/lib/db/groups";
import { buildPersonView, findPerson } from "@/lib/group-view";

export const dynamic = "force-dynamic";

export default async function PersonPage({ params }: { params: Promise<{ groupId: string; token: string }> }) {
  const { groupId, token } = await params;
  const g = await getGroup(groupId);
  const me = g ? findPerson(g, token) : undefined;
  if (!g || !me) notFound();
  return <Questionnaire initial={buildPersonView(g, me)} groupId={groupId} token={token} />;
}

export const metadata = { title: "Your answers · Common Ground", robots: { index: false } };
