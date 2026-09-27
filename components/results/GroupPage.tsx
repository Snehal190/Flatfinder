"use client";

import { useEffect, useState } from "react";
import type { GroupView } from "@/lib/group-view";
import { ResultsView } from "./ResultsView";
import { WaitingState } from "./WaitingState";

/** Polls the group endpoint so the page unlocks, and results recompute, without a refresh. */
export function GroupPage({ initial }: { initial: GroupView }) {
  const [view, setView] = useState(initial);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/groups/${initial.id}`, { cache: "no-store" });
        if (res.ok) setView((await res.json()) as GroupView);
      } catch {
        /* keep last known state */
      }
    }, 6000);
    return () => clearInterval(id);
  }, [initial.id]);

  return view.unlocked ? <ResultsView view={view} unlocked={view.unlocked} /> : <WaitingState view={view} />;
}
