"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { PersonView } from "@/lib/group-view";
import { DEMO_ANSWERS, DEMO_NAMES } from "@/lib/demo";
import type { PersonAnswers } from "@/lib/schema";
import { StatusStrip } from "./StatusStrip";
import { StepFlat } from "./StepFlat";
import { StepLifestyle } from "./StepLifestyle";
import { StepMoney } from "./StepMoney";
import { StepReview } from "./StepReview";
import { StepWhere } from "./StepWhere";
import { STEPS } from "./types";

type SaveState = "idle" | "saving" | "saved" | "error";

export function Questionnaire({ initial, groupId, token }: { initial: PersonView; groupId: string; token: string }) {
  const [view, setView] = useState(initial);
  const [answers, setAnswers] = useState<PersonAnswers>(initial.me.answers);
  const [step, setStep] = useState(initial.me.submittedAt ? 4 : 0);
  const [save, setSave] = useState<SaveState>("idle");
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const dirty = useRef(false);
  const topRef = useRef<HTMLHeadingElement>(null);
  const api = `/api/groups/${groupId}/people/${token}`;
  const submitted = view.me.submittedAt !== null;

  const set = useCallback((patch: Partial<PersonAnswers>) => {
    dirty.current = true;
    setAnswers((a) => ({ ...a, ...patch }));
  }, []);

  // Debounced autosave on every change.
  useEffect(() => {
    if (!dirty.current) return;
    setSave("saving");
    const t = setTimeout(async () => {
      try {
        const res = await fetch(api, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(answers) });
        setSave(res.ok ? "saved" : "error");
      } catch {
        setSave("error");
      }
    }, 600);
    return () => clearTimeout(t);
  }, [answers, api]);

  // Poll submitted/pending status (only statuses, never others' answers).
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch(api, { cache: "no-store" });
        if (res.ok) {
          const v = (await res.json()) as PersonView;
          setView((old) => ({ ...old, group: v.group, me: { ...old.me, submittedAt: v.me.submittedAt } }));
        }
      } catch {
        /* offline: keep last known status */
      }
    }, 8000);
    return () => clearInterval(id);
  }, [api]);

  const go = (s: number) => {
    setStep(s);
    setConfirming(false);
    topRef.current?.scrollIntoView({ block: "start" });
    topRef.current?.focus({ preventScroll: true });
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${api}/submit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(answers) });
      if (res.ok) {
        setView((await res.json()) as PersonView);
        setJustSubmitted(true);
        setConfirming(false);
        window.scrollTo({ top: 0 });
      } else setSave("error");
    } finally {
      setSubmitting(false);
    }
  };

  const others = view.group.people.filter((p) => p.position !== view.me.position);
  const pending = others.filter((p) => !p.submitted).map((p) => p.name);

  if (justSubmitted) {
    return (
      <>
        <StatusStrip people={view.group.people} meIndex={view.me.position} />
        <main className="mx-auto max-w-[720px] px-4 py-20 text-center sm:py-28">
          <p className="label-util mb-6">Submitted ✓</p>
          <h1 className="text-5xl font-black leading-[0.9] tracking-tighter sm:text-7xl">Thanks, {view.me.name}.</h1>
          <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-ink/70">
            {view.group.allSubmitted
              ? "Everyone's in. The options are ready."
              : `Waiting on ${pending.join(" and ")}. Nobody sees anyone's answers until all three of you are done.`}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Link href={`/g/${groupId}`} className="rounded-full bg-accent px-8 py-3 text-xs font-bold uppercase tracking-wider">
              {view.group.allSubmitted ? "See the options" : "Go to the group page"}
            </Link>
            <button type="button" onClick={() => { setJustSubmitted(false); go(4); }} className="text-sm font-semibold underline decoration-accent decoration-2 underline-offset-4">
              Review my answers
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <StatusStrip people={view.group.people} meIndex={view.me.position} />
      <main className="mx-auto max-w-[720px] px-4 pb-32 pt-10 sm:pt-14">
        <p className="label-util mb-4">{view.group.name ?? "Your flat hunt"}</p>
        <h1 className="text-5xl font-black leading-[0.9] tracking-tighter sm:text-6xl">
          This one&apos;s yours, <span className="italic">{view.me.name}</span>.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink/70">
          Fill it in on your own. Nobody sees anyone&apos;s answers until all three of you have submitted. It&apos;s all taps, no typing.
        </p>

        {submitted && (
          <p className="mt-6 rounded-2xl border border-ink/15 bg-bg-2 p-4 text-sm leading-relaxed">
            <strong>You&apos;ve submitted.</strong>{" "}
            {view.group.allSubmitted ? (
              <>Changes save automatically and the <Link className="underline decoration-accent decoration-2 underline-offset-4" href={`/g/${groupId}`}>results</Link> update live.</>
            ) : (
              <>You can still change anything; it saves automatically.</>
            )}
          </p>
        )}

        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-ink/25 p-3">
            <span className="label-util">Dev</span>
            {DEMO_NAMES.map((n) => (
              <button key={n} type="button" onClick={() => set(DEMO_ANSWERS[n])} className="rounded-full border border-ink/20 px-3 py-1.5 text-xs font-semibold hover:border-ink">
                Fill as {n} with demo answers
              </button>
            ))}
          </div>
        )}

        <nav aria-label="Form progress" className="mt-7">
          <ol className="grid grid-cols-5 gap-1.5">
            {STEPS.map((s, i) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-current={i === step ? "step" : undefined}
                  aria-label={`Step ${i + 1}: ${s}`}
                  className="group block w-full py-3 text-left"
                >
                  <span className={`block h-1.5 rounded-full transition-colors duration-300 ease-house ${i < step ? "bg-ink" : i === step ? "bg-accent" : "bg-ink/10 group-hover:bg-ink/25"}`} />
                  <span className={`mt-2 hidden text-[10px] font-bold uppercase tracking-wider sm:block ${i === step ? "text-ink" : "text-ink/60"}`}>{s}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <h2 ref={topRef} tabIndex={-1} className="label-util mb-8 mt-10 scroll-mt-40 outline-none">
          Step {step + 1} of 5 · {STEPS[step]}
        </h2>

        {step === 0 && <StepMoney answers={answers} set={set} />}
        {step === 1 && <StepWhere answers={answers} set={set} />}
        {step === 2 && <StepFlat answers={answers} set={set} />}
        {step === 3 && <StepLifestyle answers={answers} set={set} />}
        {step === 4 && <StepReview answers={answers} onEdit={go} />}

        {confirming && (
          <div role="alertdialog" aria-labelledby="confirm-title" aria-describedby="confirm-desc" className="mt-10 rounded-2xl border-2 border-ink bg-bg-2 p-6">
            <h3 id="confirm-title" className="text-2xl font-bold tracking-tight">Submit your answers?</h3>
            <p id="confirm-desc" className="mt-2 leading-relaxed text-ink/70">
              Once all three of you submit, everyone sees the options and each other&apos;s dealbreakers. You can still edit afterwards.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button variant="ink" onClick={submit} disabled={submitting} autoFocus>{submitting ? "Submitting…" : "Yes, submit"}</Button>
              <Button variant="ghost" onClick={() => setConfirming(false)}>Not yet</Button>
            </div>
          </div>
        )}
      </main>

      <div className="glass fixed inset-x-0 bottom-0 z-40 border-t border-ink/5">
        <div className="mx-auto flex max-w-[720px] items-center justify-between gap-3 px-4 py-3">
          <Button variant="ghost" onClick={() => go(step - 1)} disabled={step === 0} className="px-5">← Back</Button>
          <span className="text-xs font-semibold text-ink/70" aria-live="polite">
            {save === "saving" ? "Saving…" : save === "saved" ? "Saved ✓" : save === "error" ? "⚠ Not saved, retrying on next change" : ""}
          </span>
          {step < 4 ? (
            <Button variant="ink" onClick={() => go(step + 1)} className="px-6">Next →</Button>
          ) : submitted ? (
            <Link href={`/g/${groupId}`} className="rounded-full bg-accent px-6 py-3 text-xs font-bold uppercase tracking-wider">Group page</Link>
          ) : (
            <Button variant="accent" onClick={() => setConfirming(true)} className="px-6">Submit my answers</Button>
          )}
        </div>
      </div>
    </>
  );
}
