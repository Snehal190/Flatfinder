import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  size?: number;
  bounce?: boolean;
  className?: string;
  label?: string;
}

/** Circular accent badge; optional slow 4s vertical float (disabled for reduced motion). */
export function FloatingBadge({ children, size = 160, bounce = false, className = "", label }: Props) {
  return (
    <div
      role={label ? "img" : undefined}
      aria-label={label}
      className={`flex shrink-0 flex-col items-center justify-center rounded-full bg-accent text-ink shadow-[0_12px_40px_-12px_rgba(38,38,38,0.35)] ${bounce ? "animate-float" : ""} ${className}`}
      style={{ width: size, height: size }}
    >
      {children}
    </div>
  );
}
