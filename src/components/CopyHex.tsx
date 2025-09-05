"use client";

import { useState } from "react";

export function CopyHex({ hex }: { hex: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={async (e) => {
        // Prevent parent link/card navigation when copying
        e.preventDefault();
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(hex);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch {}
      }}
      className="text-[11px] px-1.5 py-0.5 rounded backdrop-blur border"
      style={{
        background: "color-mix(in oklab, var(--surface), transparent 30%)",
        borderColor: "var(--border)",
        color: "var(--text-primary)",
      }}
      aria-label={`Copy ${hex}`}
      title="Copy HEX"
    >
      {copied ? "Copied!" : hex}
    </button>
  );
}
