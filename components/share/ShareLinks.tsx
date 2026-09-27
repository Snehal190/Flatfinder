"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { personInviteMessage, resultsInviteMessage } from "@/lib/messages";

export interface CreatedGroup {
  groupId: string;
  groupName: string | null;
  people: { name: string; token: string }[];
}

/** One big "copy invite" per person. The copied message already contains the link. */
function CopyInvite({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={copy}
      className={`min-h-[48px] w-full rounded-full px-6 text-xs font-bold uppercase tracking-wider transition-all duration-300 ease-house sm:w-auto ${
        copied ? "bg-ink text-bg" : "bg-accent text-ink hover:-translate-y-0.5"
      }`}
    >
      <span aria-live="polite">{copied ? "✓ Copied, now paste it in WhatsApp" : label}</span>
    </button>
  );
}

export function ShareLinks({ group }: { group: CreatedGroup }) {
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const groupUrl = `${origin}/g/${group.groupId}`;

  return (
    <main className="mx-auto max-w-[640px] px-4 py-12 sm:py-16">
      <p className="label-util mb-4">Group created ✓</p>
      <h1 className="text-5xl font-black leading-[0.9] tracking-tighter sm:text-6xl">Now send everyone their link.</h1>
      <p className="mt-4 text-lg leading-relaxed text-ink/70">
        Copy each invite and send it to that person privately. Everyone fills in their own form. Nobody sees anyone else&apos;s answers.
      </p>

      <ul className="mt-10 space-y-4">
        {group.people.map((p) => {
          const url = `${origin}/g/${group.groupId}/p/${p.token}`;
          return (
            <li key={p.token} className="flex flex-col gap-4 rounded-3xl bg-bg-2 p-5 ring-1 ring-ink/5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <p className="text-2xl font-bold tracking-tight">{p.name}</p>
                <Link href={`/g/${group.groupId}/p/${p.token}`} className="text-sm font-semibold text-ink/70 underline decoration-accent decoration-2 underline-offset-4 hover:text-ink">
                  This is me, open my form
                </Link>
              </div>
              <CopyInvite text={personInviteMessage(p.name, url)} label={`Copy invite for ${p.name}`} />
            </li>
          );
        })}
      </ul>

      <section className="mt-10 border-t border-ink/10 pt-8">
        <h2 className="text-xl font-bold tracking-tight">When you&apos;re all done</h2>
        <p className="mt-2 leading-relaxed text-ink/70">
          The results show up at the group page once all three have submitted. Drop this in your group chat:
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <CopyInvite text={resultsInviteMessage(groupUrl)} label="Copy group link" />
          <Link href={`/g/${group.groupId}`} className="text-center text-sm font-semibold underline decoration-accent decoration-2 underline-offset-4">
            Open group page
          </Link>
        </div>
      </section>
      <p className="mt-8 rounded-2xl border border-ink/10 p-4 text-sm text-ink/70">
        Tip: copy the invites before leaving this page. The links aren&apos;t shown again.
      </p>
    </main>
  );
}
