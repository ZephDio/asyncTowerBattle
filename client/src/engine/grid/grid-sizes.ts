export type GridSize = { width: number; height: number };

// What a round brings to the army grid: its size, and the rocks and trees that appear on its free cells.
export type RoundGrowth = { size: GridSize; rocks: number; trees: number };

// Grid growth cycle, one entry per round (see docs/round-draft.md). Enemy boards must match the allied size of the
// same round. Rounds past the end of the cycle keep the last size and add nothing.
export const GRID_GROWTH_CYCLE = [
	{ size: { width: 8, height: 6 }, rocks: 2, trees: 3 },
	{ size: { width: 9, height: 7 }, rocks: 0, trees: 0 },
	{ size: { width: 9, height: 7 }, rocks: 1, trees: 0 },
	{ size: { width: 11, height: 7 }, rocks: 0, trees: 2 },
	{ size: { width: 11, height: 7 }, rocks: 1, trees: 0 },
	{ size: { width: 11, height: 7 }, rocks: 0, trees: 0 },
	{ size: { width: 11, height: 7 }, rocks: 1, trees: 0 },
	{ size: { width: 13, height: 8 }, rocks: 0, trees: 2 },
] as const satisfies RoundGrowth[];

export const roundGrowth = (round: number): RoundGrowth => {
	const growth = GRID_GROWTH_CYCLE[round - 1];
	if (growth) return growth;
	return { size: GRID_GROWTH_CYCLE[GRID_GROWTH_CYCLE.length - 1]!.size, rocks: 0, trees: 0 };
};

export const armyGridSize = (round: number): GridSize => roundGrowth(round).size;

// On-screen height of an army grid. The cell size shrinks as the grid grows so the board keeps the same footprint.
export const ARMY_GRID_SCREEN_HEIGHT = 30;

export const fitCellSize = (height: number) => ARMY_GRID_SCREEN_HEIGHT / height;
