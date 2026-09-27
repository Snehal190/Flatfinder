import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "accent" | "ink" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 ease-house disabled:cursor-not-allowed disabled:opacity-40";
const variants: Record<Variant, string> = {
  accent: "bg-accent text-ink hover:-translate-y-0.5",
  ink: "bg-ink text-bg hover:-translate-y-0.5",
  ghost: "border border-ink/20 bg-transparent text-ink hover:border-ink",
};

export function Button({
  variant = "ink",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type="button" className={`${base} ${variants[variant]} ${className}`} {...rest} />;
}

export function ButtonLink({
  href,
  variant = "ink",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}

/** Text link with arrow and a 2px accent underline (hero CTA style). */
export function ArrowLink({ href, children, plain = false }: { href: string; children: ReactNode; plain?: boolean }) {
  const cls =
    "group inline-flex items-center gap-3 border-b-2 border-accent pb-1 text-lg font-bold tracking-tight transition-colors duration-300 ease-house hover:border-ink";
  const inner = (
    <>
      {children}
      <span aria-hidden className="transition-transform duration-300 ease-house group-hover:translate-x-1">→</span>
    </>
  );
  return plain ? <a href={href} className={cls}>{inner}</a> : <Link href={href} className={cls}>{inner}</Link>;
}
