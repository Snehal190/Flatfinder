/**
 * Local, deterministic placeholder "photo": a muted architectural line drawing.
 * Rendered grayscale by default; parents add `group` to get colour + zoom on hover.
 */
const PALETTE = ["#e4a4bd", "#d8c3b5", "#c9b0a0", "#b8a597", "#e9d6cc"];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

interface Props {
  seed: string;
  areaLabel: string;
  floors?: number;
  className?: string;
}

export function ListingArt({ seed, areaLabel, floors = 8, className = "" }: Props) {
  const h = hash(seed);
  const pick = (n: number, shift: number) => (h >>> shift) % n;
  const main = PALETTE[pick(PALETTE.length, 0)];
  const second = PALETTE[pick(PALETTE.length, 5)];
  const cols = 3 + pick(3, 9);
  const rows = Math.min(9, Math.max(3, floors > 9 ? 8 : floors + 1));
  const bw = 150 + pick(60, 12);
  const bx = 60 + pick(50, 17);
  const bh = 60 + rows * 34;
  const by = 380 - bh;
  const cw = (bw - 24) / cols;
  const rh = (bh - 30) / rows;
  const hasTower = pick(2, 21) === 1;
  const sun = 60 + pick(260, 23);

  return (
    <svg viewBox="0 0 400 400" role="img" aria-label={`Illustration of a building in ${areaLabel}`} className={className} preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="400" fill="#f5f0eb" />
      <circle cx={sun} cy="80" r="34" fill={main} opacity="0.55" />
      <path d="M0 330 Q 100 290 200 320 T 400 300 V400 H0Z" fill={second} opacity="0.35" />
      {hasTower && (
        <g>
          <rect x={bx + bw + 20} y={by + 60} width="90" height={bh - 60} fill="#fdf8f3" stroke="#262626" strokeWidth="2" />
          {Array.from({ length: Math.floor((bh - 80) / 30) }).map((_, i) => (
            <line key={i} x1={bx + bw + 30} x2={bx + bw + 100} y1={by + 80 + i * 30} y2={by + 80 + i * 30} stroke="#262626" strokeWidth="1" opacity="0.5" />
          ))}
        </g>
      )}
      <rect x={bx} y={by} width={bw} height={bh} fill="#fdf8f3" stroke="#262626" strokeWidth="2.5" />
      <rect x={bx - 8} y={by - 10} width={bw + 16} height="10" fill="#262626" />
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((__, c) => {
          const lit = hash(`${seed}-${r}-${c}`) % 5 === 0;
          return (
            <rect
              key={`${r}-${c}`}
              x={bx + 12 + c * cw + 4}
              y={by + 14 + r * rh + 4}
              width={cw - 8}
              height={rh - 10}
              fill={lit ? main : "#f5f0eb"}
              stroke="#262626"
              strokeWidth="1.2"
            />
          );
        }),
      )}
      <line x1="0" x2="400" y1="380" y2="380" stroke="#262626" strokeWidth="2" />
      <text x="200" y="372" textAnchor="middle" fontSize="13" fontWeight="900" letterSpacing="4" fill="#262626" fontFamily="var(--font-spartan), sans-serif">
        {areaLabel.toUpperCase()}
      </text>
    </svg>
  );
}
