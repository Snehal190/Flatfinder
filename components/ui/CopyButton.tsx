"use client";

import { useState } from "react";

export function CopyButton({ text, label, className = "" }: { text: string; label: string; className?: string }) {
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
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex min-h-[40px] items-center gap-2 rounded-full border border-ink/20 px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ease-house hover:border-ink ${
        copied ? "bg-ink text-bg" : ""
      } ${className}`}
    >
      <span aria-hidden>{copied ? "✓" : "⧉"}</span>
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}
