"use client";

import { useState } from "react";

export function CopyHex({ hex }: { hex: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(hex);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch {}
      }}
      className="text-[11px] px-1.5 py-0.5 rounded bg-white/70 backdrop-blur border hover:bg-white dark:bg-slate-900/70 dark:hover:bg-slate-900 dark:border-slate-800"
      aria-label={`Copy ${hex}`}
      title="Copy HEX"
    >
      {copied ? "Copied!" : hex}
    </button>
  );
}
