import { runRandom } from "../../shared/run-random";

export type GrassKind = "small" | "wide" | "tall" | "big";

// How many variants of each kind scripts/generate-grass.py draws.
export const GRASS_VARIANTS: Record<GrassKind, number> = { small: 4, wide: 2, tall: 2, big: 3 };

export type GrassPatch = {
	// Bottom left cell of the patch, and its size in cells. A patch may stick out of the grid.
	column: number;
	row: number;
	columns: number;
	rows: number;
	kind: GrassKind;
	variant: number;
	flipX: boolean;
};

type Piece = { x: number; y: number; columns: number; rows: number; kind: GrassKind };

// How a block of 2 x 2 cells is cut in patches.
const BLOCKS: { weight: number; pieces: Piece[] }[] = [
	{ weight: 3, pieces: [{ x: 0, y: 0, columns: 2, rows: 2, kind: "big" }] },
	{
		weight: 1,
		pieces: [
			{ x: 0, y: 0, columns: 2, rows: 1, kind: "wide" },
			{ x: 0, y: 1, columns: 2, rows: 1, kind: "wide" },
		],
	},
	{
		weight: 1,
		pieces: [
			{ x: 0, y: 0, columns: 1, rows: 2, kind: "tall" },
			{ x: 1, y: 0, columns: 1, rows: 2, kind: "tall" },
		],
	},
	{
		weight: 1,
		pieces: [
			{ x: 0, y: 0, columns: 1, rows: 1, kind: "small" },
			{ x: 1, y: 0, columns: 1, rows: 1, kind: "small" },
			{ x: 0, y: 1, columns: 1, rows: 1, kind: "small" },
			{ x: 1, y: 1, columns: 1, rows: 1, kind: "small" },
		],
	},
	{
		weight: 1,
		pieces: [
			{ x: 0, y: 0, columns: 2, rows: 1, kind: "wide" },
			{ x: 0, y: 1, columns: 1, rows: 1, kind: "small" },
			{ x: 1, y: 1, columns: 1, rows: 1, kind: "small" },
		],
	},
	{
		weight: 1,
		pieces: [
			{ x: 0, y: 0, columns: 1, rows: 2, kind: "tall" },
			{ x: 1, y: 0, columns: 1, rows: 1, kind: "small" },
			{ x: 1, y: 1, columns: 1, rows: 1, kind: "small" },
		],
	},
];
const TOTAL_WEIGHT = BLOCKS.reduce((sum, block) => sum + block.weight, 0);

// The patches that cover a grid of `width` x `height` cells, drawn from the run's seed: the same seed always lays out the
// same grass. The grid is cut in bands of two rows, each band's blocks shifted by one cell or not, so the patches'
// borders criss-cross instead of making a lattice. The patches that stick out of the grid are kept, to be clipped.
const cache = new Map<string, GrassPatch[]>();

export function layoutGrass(seed: number, width: number, height: number): GrassPatch[] {
	const key = `${seed}:${width}:${height}`;
	const known = cache.get(key);
	if (known) return known;
	const patches: GrassPatch[] = [];
	for (let band = 0; band * 2 < height; band++) {
		const shift = Math.floor(runRandom(seed, "grass", "shift", band)() * 2);
		for (let block = 0; 2 * block - shift < width; block++) {
			const random = runRandom(seed, "grass", block, band);
			let pick = random() * TOTAL_WEIGHT;
			const layout = BLOCKS.find((candidate) => (pick -= candidate.weight) < 0) ?? BLOCKS[0]!;
			for (const piece of layout.pieces) {
				patches.push({
					column: 2 * block - shift + piece.x,
					row: 2 * band + piece.y,
					columns: piece.columns,
					rows: piece.rows,
					kind: piece.kind,
					variant: Math.floor(random() * GRASS_VARIANTS[piece.kind]),
					flipX: random() < 0.5,
				});
			}
		}
	}
	const visible = patches.filter(
		(patch) => patch.column + patch.columns > 0 && patch.column < width && patch.row < height,
	);
	cache.set(key, visible);
	return visible;
}
