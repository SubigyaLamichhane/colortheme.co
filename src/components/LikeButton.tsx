"use client";

import { Heart } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

type Props = {
  palette: { id: string; slug?: string; name: string; colors: string[] };
};

export function LikeButton({ palette }: Props) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    fetch(`/api/palettes/${encodeURIComponent(palette.id)}/like`)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setLiked(Boolean(d.liked));
        if (typeof d.count === "number") setCount(d.count);
      })
      .catch(() => void 0);
    return () => {
      active = false;
    };
  }, [palette.id]);

  const toggle = () => {
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/palettes/${encodeURIComponent(palette.id)}/like`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              slug: palette.slug,
              name: palette.name,
              colors: palette.colors,
            }),
          }
        );
        const data = await res.json();
        setLiked(Boolean(data.liked));
        if (typeof data.count === "number") setCount(data.count);
      } catch {
        // noop
      }
    });
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      aria-pressed={liked}
      aria-label={liked ? "Unlike palette" : "Like palette"}
      className={`inline-flex items-center gap-1 text-sm rounded-lg px-2 py-1 ${
        liked ? "btn-accent" : "btn-outline"
      }`}
      disabled={isPending}
    >
      <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
      <span>{typeof count === "number" ? count : "Like"}</span>
    </button>
  );
}
