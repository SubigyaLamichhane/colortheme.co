// Global design constants used across the app
export const PALETTE_COLOR_SLOTS = 5; // keep palette size consistent site-wide

// Basic bot protection knobs
export const LIKE_COOLDOWN_SECONDS = 5; // prevent rapid like/unlike spam
export const ALLOWED_ORIGINS: string[] = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
