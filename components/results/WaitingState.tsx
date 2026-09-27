import { FloatingBadge } from "@/components/ui/FloatingBadge";
import type { GroupView } from "@/lib/group-view";

export function WaitingState({ view }: { view: GroupView }) {
  const pending = view.people.filter((p) => !p.submitted);
  const names = pending.map((p) => p.name);
  const who = names.length > 1 ? `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}` : names[0];
  return (
    <main className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:py-24 md:grid-cols-[1fr_auto]">
      <div>
        <p className="label-util mb-5">{view.name ?? "Your flat hunt"}</p>
        <h1 className="text-5xl font-black leading-[0.85] tracking-tighter sm:text-8xl">
          Waiting on {who}.
        </h1>
        <p className="mt-6 max-w-lg text-xl leading-relaxed text-ink/70">
          The options unlock the moment all three of you have submitted. Until then, nobody sees anyone&apos;s answers, including here.
        </p>
        <ul className="mt-10 divide-y divide-ink/10 border-y border-ink/10" aria-label="Who has submitted">
          {view.people.map((p) => (
            <li key={p.position} className="flex items-center justify-between py-4">
              <span className="text-2xl font-bold tracking-tight">{p.name}</span>
              <span className={`label-util rounded-full px-3 py-1.5 ${p.submitted ? "bg-ink text-bg" : "border border-ink/20"}`}>
                {p.submitted ? "✓ Submitted" : "⏳ Pending"}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-ink/70">This page refreshes itself. Forgot your link? Ask whoever created the group to resend it.</p>
      </div>
      <div className="flex justify-center md:justify-end">
        <FloatingBadge bounce size={180} label={`${view.submittedCount} of 3 submitted`}>
          <span className="text-5xl font-black italic tracking-tighter">{view.submittedCount}/3</span>
          <span className="mt-1 text-[8px] font-black uppercase tracking-widest">Submitted</span>
        </FloatingBadge>
      </div>
    </main>
  );
}
