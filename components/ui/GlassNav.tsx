import Link from "next/link";

export function GlassNav() {
  return (
    <header className="glass fixed inset-x-0 top-0 z-50 h-20">
      <nav aria-label="Main" className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
        <Link href="/" className="text-base font-black uppercase tracking-tight sm:text-lg">
          Common Ground
        </Link>
        <Link
          href="/"
          className="rounded-full bg-accent px-5 py-3 text-xs font-bold uppercase tracking-wider text-ink transition-transform duration-300 ease-house hover:-translate-y-0.5 sm:px-8"
        >
          New group
        </Link>
      </nav>
    </header>
  );
}
