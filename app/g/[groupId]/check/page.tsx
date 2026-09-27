import Link from "next/link";
import { notFound } from "next/navigation";
import { FlatChecker } from "@/components/check/FlatChecker";
import { getGroup } from "@/lib/db/groups";
import { buildGroupView } from "@/lib/group-view";

export const dynamic = "force-dynamic";

export default async function CheckPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const g = await getGroup(groupId);
  if (!g) notFound();
  const view = buildGroupView(g);
  if (!view.unlocked) {
    const pending = view.people.filter((p) => !p.submitted).map((p) => p.name);
    return (
      <main className="mx-auto max-w-[720px] px-4 py-20 text-center">
        <p className="label-util">Not yet</p>
        <h1 className="mt-4 text-5xl font-black leading-[0.9] tracking-tighter">Checking flats unlocks once everyone&apos;s in.</h1>
        <p className="mt-5 text-lg text-ink/70">Still waiting on {pending.join(" and ")}. We need all three sets of answers to check a flat fairly.</p>
        <Link href={`/g/${groupId}`} className="mt-8 inline-block rounded-full bg-accent px-8 py-3 text-xs font-bold uppercase tracking-wider">Back to the group</Link>
      </main>
    );
  }
  return <FlatChecker groupId={groupId} names={view.people.map((p) => p.name)} initialChecks={view.unlocked.checks} />;
}

export const metadata = { title: "Check a flat · Common Ground", robots: { index: false } };
