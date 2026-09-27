"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { ShareLinks, type CreatedGroup } from "./ShareLinks";

const DEFAULT_NAMES = ["Riya", "Meera", "Kavita"];

const STEPS = [
  ["1", "Add your three names"],
  ["2", "Each of you fills in a short form, privately"],
  ["3", "See 3 flats you can all live with"],
];

/** Home page: the whole first step is just three names and one button. */
export function NewGroupForm() {
  const [names, setNames] = useState(DEFAULT_NAMES);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<CreatedGroup | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (names.some((n) => !n.trim())) {
      setError("Please fill in all three names.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names }),
      });
      const body = (await res.json()) as CreatedGroup & { error?: string };
      if (!res.ok) setError(body.error ?? "Something went wrong.");
      else {
        setCreated(body);
        window.scrollTo({ top: 0 });
      }
    } catch {
      setError("Couldn't reach the server. Try again?");
    } finally {
      setBusy(false);
    }
  };

  if (created) return <ShareLinks group={created} />;

  return (
    <main className="mx-auto grid max-w-6xl content-center gap-10 px-4 py-10 sm:px-8 sm:py-16 lg:min-h-[calc(100svh-80px)] lg:grid-cols-[1.1fr_1fr] lg:gap-x-20 lg:gap-y-8 lg:py-0">
      <div className="lg:self-end">
        <h1 className="text-[clamp(3.25rem,10vw,7.5rem)] font-black leading-[0.85] tracking-tighter">
          Find <span className="font-light lowercase italic text-accent">common</span> ground.
        </h1>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-ink/70 sm:text-xl">
          Flat-hunting with friends? Stop arguing over listings. Answer a few questions each, and we&apos;ll show you the flats that work for everyone.
        </p>
      </div>

      <ol className="order-last space-y-3 lg:order-none lg:col-start-1 lg:row-start-2 lg:self-start">
          {STEPS.map(([n, t]) => (
          <li key={n} className="flex items-center gap-4 text-lg font-semibold">
              <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-black">{n}</span>
              {t}
            </li>
          ))}
      </ol>

      <form onSubmit={submit} noValidate className="rounded-3xl bg-bg-2 p-6 ring-1 ring-ink/5 sm:p-10 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
        <h2 className="text-3xl font-bold tracking-tight">Who&apos;s moving in?</h2>
        <p className="mt-2 text-ink/70">Change the names if you need to.</p>
        <div className="mt-6 space-y-3">
          {names.map((n, i) => (
            <div key={i}>
              <label htmlFor={`name-${i}`} className="sr-only">Person {i + 1}</label>
              <input
                id={`name-${i}`}
                value={n}
                maxLength={30}
                required
                autoComplete="off"
                placeholder={`Person ${i + 1}`}
                onChange={(e) => setNames(names.map((x, j) => (j === i ? e.target.value : x)))}
                className="block min-h-[56px] w-full rounded-2xl border border-ink/15 bg-bg px-5 text-xl font-bold tracking-tight placeholder:text-ink/40 focus:border-ink"
              />
            </div>
          ))}
        </div>
        {error && <p role="alert" className="mt-4 font-semibold">⚠ {error}</p>}
        <Button type="submit" variant="accent" disabled={busy} className="mt-6 w-full py-4 text-sm">
          {busy ? "Creating…" : "Start our group →"}
        </Button>
        <p className="mt-5 text-center text-sm text-ink/70">
          Just looking?{" "}
          {/* Plain anchor: /demo resets data, so it must never be prefetched. */}
          <a href="/demo" className="font-semibold text-ink underline decoration-accent decoration-2 underline-offset-4">
            See an example
          </a>
        </p>
      </form>
    </main>
  );
}
