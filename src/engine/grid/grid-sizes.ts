export type GridSize = { width: number; height: number };

// Size of the army grid at each stage of a run. Enemy boards must match the allied size of the same round.
export const ARMY_GRID_SIZES = {
	round1: { width: 8, height: 6 },
	round2: { width: 9, height: 7 },
	round3: { width: 13, height: 7 },
} as const satisfies Record<string, GridSize>;

// On-screen height of an army grid. The cell size shrinks as the grid grows so the board keeps the same footprint.
export const ARMY_GRID_SCREEN_HEIGHT = 30;

export const fitCellSize = (height: number) => ARMY_GRID_SCREEN_HEIGHT / height;
