import { layoutGrass } from "./grass-layout";

const covered = (width: number, height: number, seed: number) => {
	const cells = new Map<string, number>();
	for (const patch of layoutGrass(seed, width, height)) {
		for (let c = patch.column; c < patch.column + patch.columns; c++) {
			for (let r = patch.row; r < patch.row + patch.rows; r++)
				cells.set(`${c},${r}`, (cells.get(`${c},${r}`) ?? 0) + 1);
		}
	}
	return cells;
};

describe("layoutGrass", () => {
	it.each([1, 42, 123456])("covers every cell of the grid exactly once (seed %i)", (seed) => {
		const cells = covered(7, 11, seed);
		for (let c = 0; c < 7; c++) {
			for (let r = 0; r < 11; r++) expect(cells.get(`${c},${r}`)).toBe(1);
		}
	});

	it("lays out the same grass for the same seed", () => {
		expect(layoutGrass(9, 6, 6)).toEqual(layoutGrass(9, 6, 6));
	});

	it("lays out different grass for other seeds", () => {
		expect(layoutGrass(1, 8, 8)).not.toEqual(layoutGrass(2, 8, 8));
	});

	it("shifts the patches of some bands, so their borders criss-cross", () => {
		const firstColumns = new Map<number, number>();
		for (const patch of layoutGrass(5, 10, 20)) {
			const band = Math.floor(patch.row / 2);
			firstColumns.set(band, Math.min(firstColumns.get(band) ?? 0, patch.column));
		}
		expect(new Set(firstColumns.values())).toEqual(new Set([-1, 0]));
	});
});
