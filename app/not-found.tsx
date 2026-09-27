import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-[720px] px-4 py-24 text-center">
      <p className="label-util">404</p>
      <h1 className="mt-4 text-5xl font-black tracking-tighter">That link doesn&apos;t match a group.</h1>
      <p className="mt-4 text-lg text-ink/70">Double-check the link you were sent, or start a new group.</p>
      <Link href="/" className="mt-8 inline-block rounded-full bg-accent px-8 py-3 text-xs font-bold uppercase tracking-wider">Home</Link>
    </main>
  );
}
