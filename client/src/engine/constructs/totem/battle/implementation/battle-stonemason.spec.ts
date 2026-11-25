// Loaded first: the piece modules run into the engine's grid <-> render traits import cycle otherwise.
import "../../../../match-maker/board-serializer";
import { Cell, GridPosition } from "../../../../../shared/position";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";
import { Rarity } from "../../../../../shared/traits/engine/rarity";
import { Science, requiredScienceOf } from "../../../../../shared/traits/engine/science";
import { castSpeedFromSeconds } from "../../../../../shared/seconds";
import { Rock } from "../../../../environment/rock";
import { Forest } from "../../../../environment/forest";
import { BattleGrid } from "../../../../grid/battle-grid";
import { BattleRandomSeed } from "../../../../battle/battle-random-seed";
import { Stats } from "../../../../stats/stats";
import { StoneShield } from "../../../../stats/status/stone-shield";
import { Stonemason } from "../../recruit/implementation/stonemason";
import { StonemasonBlueprint } from "../../blueprint/implementation/stonemason-blueprint";
import type { BattleArmyHooks } from "../../../../army/battle/battle-army";
import type { AnyBattleUnit } from "../../../../units/battle/battle-unit";

const grid = { width: 10, height: 10, cellToGrid: (cell: Cell) => new GridPosition({ x: cell.x, y: cell.y }) };
const at = (x: number, y: number) => new Cell({ x, y });

// A unit reduced to what the totem touches: real Stats, so the real shield boon is read and added.
const unit = (shielded = false) => {
	const stats = new Stats(10, 0, 0, 100, 0, 0, 0, 0, () => {});
	if (shielded) stats.addBoon(new StoneShield({}));
	return { stats, addBoon: (boon: StoneShield) => stats.addBoon(boon) } as unknown as AnyBattleUnit;
};

const setup = (elements: { cell: Cell; element: object }[], units: AnyBattleUnit[], seed = 1) => {
	const board = new Map(elements.map(({ cell, element }) => [`${cell.x},${cell.y}`, element]));
	const random = new BattleRandomSeed(seed);
	return {
		getAlliedUnits: () => units,
		random: () => random.random(),
		gridHooks: {
			getRelativeNeighborsInArmy: (cell: Cell, relatives: Cell[]) =>
				relatives.map((relative) => board.get(`${cell.x + relative.x},${cell.y + relative.y}`)),
		},
	} as unknown as BattleArmyHooks;
};

const shielded = (units: AnyBattleUnit[]) => units.map((u) => Boolean(u.stats.getStoneShieldBoon()));
const count = (units: AnyBattleUnit[]) => shielded(units).filter(Boolean).length;
const cast = (hooks: BattleArmyHooks, cell = at(3, 3)) => {
	const totem = new Stonemason(cell).toAllied(grid as never, hooks);
	totem.onCastResolve();
	return totem;
};

describe("Stonemason", () => {
	const blueprint = new StonemasonBlueprint({});

	it("is an Uncommon at 15 gold that needs Dwarf science, casting every 5 s for no food", () => {
		expect(blueprint.rarity).toBe(Rarity.Uncommon);
		expect(blueprint.price).toBe(15);
		expect(requiredScienceOf(blueprint)).toBe(Science.Dwarf);
		expect(blueprint.stats.castSpeed).toBeCloseTo(castSpeedFromSeconds(5));
		expect(blueprint.stats.foodConsumptionOnCast).toBeNaN();
		expect(blueprint.tags).toEqual(expect.arrayContaining(["Totem", "Mountain"]));
	});

	it("is 1 wide and 2 tall with 4 stars on both sides", () => {
		const cells = (list: Cell[]) => list.map(({ x, y }) => [x, y]);
		expect(cells(new Stonemason(at(0, 0)).gridShape.cells)).toEqual([
			[0, 0],
			[0, 1],
		]);
		expect(cells(blueprint.patternEffect.getRelativeCells(BoardOrientation.Normal))).toEqual([
			[-1, 0],
			[1, 0],
			[-1, 1],
			[1, 1],
		]);
		expect(cells(blueprint.patternEffect.getRelativeCells(BoardOrientation.Mirrored))).toEqual([
			[1, 0],
			[-1, 0],
			[1, -1],
			[-1, -1],
		]);
	});

	it("shields 2 random units with no Mountain on its stars", () => {
		const units = [unit(), unit(), unit(), unit(), unit()];
		cast(setup([], units));
		expect(count(units)).toBe(2);
	});

	it("shields one more unit per Mountain star, up to 6", () => {
		for (const mountains of [1, 2, 3, 4]) {
			const stars = [at(2, 3), at(4, 3), at(2, 4), at(4, 4)].slice(0, mountains);
			const units = Array.from({ length: 8 }, () => unit());
			cast(
				setup(
					stars.map((cell) => ({ cell, element: new Rock(cell) })),
					units,
				),
			);
			expect(count(units)).toBe(2 + mountains);
		}
	});

	it("ignores stars that are not Mountain", () => {
		const units = Array.from({ length: 6 }, () => unit());
		cast(setup([{ cell: at(2, 3), element: new Forest(at(2, 3)) }], units));
		expect(count(units)).toBe(2);
	});

	it("never picks a unit that already has a shield", () => {
		const units = [unit(true), unit(true), unit(), unit(), unit(), unit(true)];
		cast(setup([], units));
		expect(count(units)).toBe(5);
		expect(count([units[2]!, units[3]!, units[4]!])).toBe(2);
	});

	it("shields every candidate when there are fewer than its count, and does nothing with none", () => {
		const few = [unit(true), unit()];
		cast(setup([], few));
		expect(count(few)).toBe(2);

		const none = [unit(true)];
		cast(setup([], none));
		expect(count(none)).toBe(1);
		cast(setup([], []));
	});

	it("keeps one charge on a unit however many casts", () => {
		const units = [unit()];
		const hooks = setup([], units);
		cast(hooks);
		cast(hooks);
		expect(count(units)).toBe(1);
	});

	it("picks the same units with the same seed, and varies with the seed", () => {
		const run = (seed: number) => {
			const units = Array.from({ length: 10 }, () => unit());
			cast(setup([], units, seed));
			return shielded(units).join();
		};
		expect(run(42)).toBe(run(42));
		const outcomes = new Set([1, 2, 3, 4, 5, 6, 7, 8].map(run));
		expect(outcomes.size).toBeGreaterThan(1);
	});

	it("counts its stars through the mirrored pattern on the opponent board", () => {
		const units = Array.from({ length: 6 }, () => unit());
		const hooks = setup([{ cell: at(4, 3), element: new Rock(at(4, 3)) }], units);
		const flipped = BattleGrid.flip(grid as never, at(6, 6));
		expect(flipped.x).toBe(3);
		new Stonemason(at(6, 6)).toEnemy(grid as never, hooks).onCastResolve();
		expect(count(units)).toBe(3);
	});
});
