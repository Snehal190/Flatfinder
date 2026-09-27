import type { BalanceLabel } from "@/lib/matching/types";

/** Where each person's score sits on 0–100, with the spread between lowest and highest shaded. */
export function BalanceMeter({ scores, names, label }: { scores: number[]; names: string[]; label: BalanceLabel }) {
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const level = label === "Evenly shared compromise" ? 1 : label === "Somewhat uneven" ? 2 : 3;
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="label-util">Balance</p>
        <p className="text-sm font-bold">
          <span aria-hidden className="mr-1.5 tracking-tighter">{"●".repeat(level)}{"○".repeat(3 - level)}</span>
          {label}
        </p>
      </div>
      <div className="relative mt-5 h-8" role="img" aria-label={`${label}. Scores: ${names.map((n, i) => `${n} ${Math.round(scores[i])}`).join(", ")}. Spread ${Math.round(max - min)} points.`}>
        <div className="absolute inset-x-0 top-3.5 h-1 rounded-full bg-bg-2 ring-1 ring-ink/10" />
        <div className="absolute top-3 h-2 rounded-full bg-accent" style={{ left: `${min}%`, width: `${Math.max(1, max - min)}%` }} />
        {scores.map((s, i) => (
          <div key={names[i]} className="absolute top-0 -translate-x-1/2" style={{ left: `${s}%` }}>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-bg bg-ink text-[11px] font-black text-bg">
              {names[i].slice(0, 1).toUpperCase()}
            </span>
          </div>
        ))}
      </div>
      <div aria-hidden className="mt-1 flex justify-between text-[10px] font-semibold text-ink/60"><span>0</span><span>100</span></div>
    </div>
  );
}
