// Loaded first: the piece modules run into the engine's grid <-> render traits import cycle otherwise.
import "../match-maker/board-serializer";
import { Cell, GridPosition } from "../../shared/position";
import { GridShape } from "../../shared/traits/engine/core/grid-element";
import { CropsFieldBlueprint } from "../constructs/totem/blueprint/implementation/crops-field-blueprint";
import { WitchHouseBlueprint } from "../constructs/tower/blueprint/implementation/witch-house-blueprint";
import { DrillTowerBlueprint } from "../constructs/tower/blueprint/implementation/drill-tower-blueprint";
import { Buyable } from "../shop/retail/buyable";
import { ArmyGrid } from "./grid";
import { STANDARD_CELL_SIZE } from "./grid-scale";
import { RetailGrid, offerScale } from "./retail-grid";

const cells = (...coords: [number, number][]) => coords.map(([x, y]) => new Cell({ x, y }));
const block = (width: number, height: number) =>
	cells(...Array.from({ length: width * height }, (_, i): [number, number] => [i % width, Math.floor(i / width)]));

// The shop's slots: four columns, a bottom row and a top row.
const SLOTS = cells([1, 1], [1, 3], [3, 1], [3, 3], [5, 1], [5, 3], [7, 1], [7, 3]);
const BOTTOM = new Cell({ x: 1, y: 1 });
const TOP = new Cell({ x: 1, y: 3 });

const offer = (blueprint: { toRecruit(cell: Cell): Buyable["entity"] }, slot: Cell) =>
	new Buyable(blueprint.toRecruit(slot), slot, 10);

// A real Witch House given a bigger footprint, as a future construct could have.
const bigOffer = (footprint: Cell[], slot: Cell) => {
	const recruit = new WitchHouseBlueprint({}).toRecruit(slot);
	recruit.gridShape = new GridShape(footprint);
	return new Buyable(recruit, slot, 10);
};

// A grid position, in cells from the grid's bottom left corner.
const at = (x: number, y: number) => new GridPosition({ x: x * STANDARD_CELL_SIZE, y: y * STANDARD_CELL_SIZE });

const siteOf = (grid: RetailGrid, slot: Cell) => {
	const index = grid.slots.findIndex((cell) => ArmyGrid.posToString(cell) === ArmyGrid.posToString(slot));
	return grid.plots({ x: 0, y: 0 }, 48)[index]!;
};

describe("RetailGrid", () => {
	describe("offerScale", () => {
		it("keeps an offer that fits its slot at its size", () => {
			expect(offerScale(cells([0, 0]))).toBe(1);
			expect(offerScale(cells([0, 0], [0, 1]))).toBe(1);
			expect(offerScale(cells([0, 0], [-1, 0], [0, -1]))).toBe(1);
		});

		it("shrinks a bigger footprint to fit a 1.8 cell box", () => {
			expect(offerScale(block(4, 4))).toBeCloseTo(0.45);
			expect(offerScale(block(8, 1))).toBeCloseTo(0.225);
			expect(offerScale(block(1, 8))).toBeCloseTo(0.225);
		});
	});

	describe("offerAt", () => {
		it("finds a top row offer where it is drawn, above its cell, and not in the bottom of its cell", () => {
			const grid = new RetailGrid(SLOTS);
			const crops = offer(new CropsFieldBlueprint({}), TOP);
			grid.setElement(crops);

			expect(grid.offerAt(at(1.5, 4.25))).toBe(crops);
			expect(grid.offerAt(at(1.5, 3.1))).toBeUndefined();
		});

		it("finds a bottom row offer on its cell", () => {
			const grid = new RetailGrid(SLOTS);
			const crops = offer(new CropsFieldBlueprint({}), BOTTOM);
			grid.setElement(crops);

			expect(grid.offerAt(at(1.5, 1.5))).toBe(crops);
		});

		it("finds a shrunk offer away from its slot's cell, within its drawn box only", () => {
			const grid = new RetailGrid(SLOTS);
			const long = bigOffer(block(8, 1), BOTTOM);
			grid.setElement(long);

			expect(grid.offerAt(at(2.3, 1.5))).toBe(long);
			expect(grid.offerAt(at(2.3, 1.9))).toBeUndefined();
		});

		it("misses the grass between the offers", () => {
			const grid = new RetailGrid(SLOTS);
			grid.setElement(offer(new CropsFieldBlueprint({}), BOTTOM));
			grid.setElement(offer(new CropsFieldBlueprint({}), TOP));

			expect(grid.offerAt(at(2.5, 2.5))).toBeUndefined();
			expect(grid.offerAt(at(0.2, 2.5))).toBeUndefined();
		});
	});

	describe("building sites", () => {
		it("takes the offer's footprint, and its scale when shrunk", () => {
			const grid = new RetailGrid(SLOTS);
			grid.setElement(offer(new DrillTowerBlueprint({}), BOTTOM));
			grid.setElement(bigOffer(block(4, 4), TOP));

			expect(siteOf(grid, BOTTOM).cells).toHaveLength(3);
			expect(siteOf(grid, BOTTOM).scale).toBe(1);
			expect(siteOf(grid, TOP).cells).toHaveLength(16);
			expect(siteOf(grid, TOP).scale).toBeCloseTo(0.45);
		});

		it("keeps the offer's shape once it is held or sold, until the offers are cleared", () => {
			const grid = new RetailGrid(SLOTS);
			const drill = offer(new DrillTowerBlueprint({}), BOTTOM);
			grid.setElement(drill);
			grid.tiles.delete(ArmyGrid.posToString(drill.cell));

			expect(siteOf(grid, BOTTOM).cells).toHaveLength(3);

			grid.clearOffers();
			expect(siteOf(grid, BOTTOM).cells).toHaveLength(1);
			expect(siteOf(grid, BOTTOM).scale).toBe(1);
		});

		it("gives an empty slot a one cell site", () => {
			const grid = new RetailGrid(SLOTS);
			expect(siteOf(grid, TOP).cells).toEqual(cells([0, 0]));
		});
	});
});
