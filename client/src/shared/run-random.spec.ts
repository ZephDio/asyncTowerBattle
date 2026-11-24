import "../engine/match-maker/board-serializer";
// After the serializer: loaded first, these run into the engine's grid <-> render traits import cycle.
import { ArmyGrid } from "../engine/grid/grid";
import { EnvironmentGeneration } from "../engine/environment/env-generation";
import { roundGrowth } from "../engine/grid/grid-sizes";
import { RetailFiller } from "../engine/shop/retail/retail-filler";
import { Cell } from "./position";
import { deriveSeed, runRandom, SEED_RANGE } from "./run-random";

const draws = (random: () => number, count = 5) => Array.from({ length: count }, random);

const slots = Array.from({ length: 8 }, (_, index) => new Cell({ x: index, y: 0 }));
const offers = (random: () => number) =>
	new RetailFiller(3, random).getFreshItems(slots).map(({ recruit }) => recruit.constructor.name);

const trees = (random: () => number) => {
	const grid = ArmyGrid.sized(roundGrowth(1).size);
	new EnvironmentGeneration().generateForRound(grid, roundGrowth(1), random);
	return grid
		.getElements()
		.map((element) => `${element.constructor.name}@${element.cell.x},${element.cell.y}`)
		.sort();
};

describe("run random", () => {
	it("draws the same numbers for the same run and step, and others for another step or run", () => {
		expect(draws(runRandom(7, "shop", 1, 0))).toEqual(draws(runRandom(7, "shop", 1, 0)));
		expect(draws(runRandom(7, "shop", 1, 0))).not.toEqual(draws(runRandom(7, "shop", 1, 1)));
		expect(draws(runRandom(7, "shop", 1, 0))).not.toEqual(draws(runRandom(8, "shop", 1, 0)));
		draws(runRandom(7, "shop", 1, 0), 100).forEach((value) => {
			expect(value).toBeGreaterThanOrEqual(0);
			expect(value).toBeLessThan(1);
		});
	});

	it("derives battle seeds the battles can use, one per round", () => {
		const seeds = [1, 2, 3, 4].map((round) => deriveSeed(99, "battle", round));
		expect(seeds).toEqual([1, 2, 3, 4].map((round) => deriveSeed(99, "battle", round)));
		expect(new Set(seeds).size).toBe(4);
		seeds.forEach((seed) => {
			expect(Number.isInteger(seed)).toBe(true);
			expect(seed).toBeGreaterThanOrEqual(0);
			expect(seed).toBeLessThan(SEED_RANGE);
		});
	});

	it("makes the same shop offers and the same environment from the same run", () => {
		expect(offers(runRandom(5, "shop", 3, 0))).toEqual(offers(runRandom(5, "shop", 3, 0)));
		expect(offers(runRandom(5, "shop", 3, 0))).not.toEqual(offers(runRandom(6, "shop", 3, 0)));
		expect(trees(runRandom(5, "environment", 1))).toEqual(trees(runRandom(5, "environment", 1)));
		expect(trees(runRandom(5, "environment", 1))).not.toEqual(trees(runRandom(6, "environment", 1)));
	});
});
