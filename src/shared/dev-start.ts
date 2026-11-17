// Dev start mode, turned on by opening the game with `?dev` in the URL (`pnpm start:dev`): plenty of gold and flat
// rarity odds from the first round, to try pieces out quickly.
export const DEV_START = typeof location !== "undefined" && new URLSearchParams(location.search).has("dev");
