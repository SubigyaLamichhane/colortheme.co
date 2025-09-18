"use client";

export default function HeroSearch() {
  return (
    <section className="rounded-2xl border p-6 md:p-8 theme-surface theme-border">
      <div className="max-w-3xl space-y-4">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Find the perfect color palette
        </h1>
        <p className="text-sm text-secondary">
          Explore curated palettes for brands, UI, and marketing. Copy HEX in
          one click and save your favorites.
        </p>
        <form action="/palettes/all" method="GET" className="mt-4">
          <div className="flex gap-2">
            <input
              name="q"
              placeholder="Search palettes, colors, tags"
              className="flex-1 px-3 py-2 text-sm input-base"
              aria-label="Search palettes"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-lg text-sm btn-accent"
              title="Search palettes"
            >
              Search
            </button>
            <button
              type="button"
              onClick={(ev) => {
                const form = (ev.currentTarget as HTMLButtonElement).closest(
                  "form"
                );
                const input = form?.querySelector(
                  "input[name='q']"
                ) as HTMLInputElement | null;
                const val = input?.value?.trim();
                if (!val) return;
                // fire a custom event for AI section to pick up
                window.dispatchEvent(
                  new CustomEvent("ai-generate", { detail: { prompt: val } })
                );
                // update URL with ?ai= for shareability
                try {
                  const url = new URL(window.location.href);
                  url.searchParams.set("ai", val);
                  history.replaceState({}, "", url);
                } catch {}
                // scroll to AI section
                document.getElementById("ai")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
              className="px-3 py-2 rounded-lg text-sm btn-outline"
              title="Generate with AI"
            >
              ✨ AI
            </button>
          </div>
        </form>
        <div className="pt-3 text-xs text-secondary">
          Or try AI with a prompt, or browse hubs below.
        </div>
      </div>
    </section>
  );
}
