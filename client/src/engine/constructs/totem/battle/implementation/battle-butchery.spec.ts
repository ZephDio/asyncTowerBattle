// Loaded first: the piece modules run into the engine's grid <-> render traits import cycle otherwise.
import "../../../../match-maker/board-serializer";
import { Cell, GridPosition } from "../../../../../shared/position";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";
import { Rarity } from "../../../../../shared/traits/engine/rarity";
import { Science, requiredScienceOf } from "../../../../../shared/traits/engine/science";
import { castSpeedFromSeconds } from "../../../../../shared/seconds";
import { BattleGrid } from "../../../../grid/battle-grid";
import { BattleRandomSeed } from "../../../../battle/battle-random-seed";
import { Butchery } from "../../recruit/implementation/butchery";
import { ButcheryBlueprint } from "../../blueprint/implementation/butchery-blueprint";
import { RushBarrack } from "../../../barrack/recruit/implementation/rush-barrack";
import { Fox } from "../../../../units/recruit/implementation/fox";
import { Ent } from "../../../../units/recruit/implementation/ent";
import type { BattleArmyHooks } from "../../../../army/battle/battle-army";
import type { BattlePath } from "../../../../path/battle/battle-path";
import type { AnyBattleUnit } from "../../../../units/battle/battle-unit";

const grid = { width: 10, height: 10, cellToGrid: (cell: Cell) => new GridPosition({ x: cell.x, y: cell.y }) };
const at = (x: number, y: number) => new Cell({ x, y });

const path = { getNodes: () => [new GridPosition({ x: 100, y: 0 })] } as unknown as BattlePath;

// `kinds` lists the allied battle units: true for a Fox (an Animal), false for an Ent (not one).
const setup = (kinds: boolean[], seed = 1, board: Record<string, object> = {}) => {
	const random = new BattleRandomSeed(seed);
	const left: AnyBattleUnit[] = [];
	const unitBuffs: string[] = [];
	const towerBuffs: string[] = [];
	const food: number[] = [];
	const hooks = {
		getAlliedUnits: () => left,
		removeUnit: (u: AnyBattleUnit) => left.splice(left.indexOf(u), 1),
		random: () => random.random(),
		onUnitAdded: () => {},
		alliedFoodHooks: { addFood: (amount: number) => food.push(amount) },
		alliedArmyBuffHooks: {
			addUnitBuff: (buff: string) => unitBuffs.push(buff),
			addTowerBuff: (buff: string) => towerBuffs.push(buff),
		},
		gridHooks: {
			getRelativeNeighborsInArmy: (cell: Cell, relatives: Cell[]) =>
				relatives.map((relative) => board[`${cell.x + relative.x},${cell.y + relative.y}`]),
		},
	} as unknown as BattleArmyHooks;
	const origin = new GridPosition({ x: 0, y: 0 });
	const units = kinds.map((animal) =>
		animal ? new Fox(at(0, 0)).toBattle(origin, path, hooks) : new Ent(at(0, 0)).toBattle(origin, path, hooks),
	);
	left.push(...units);
	return { hooks, left, units, unitBuffs, towerBuffs, food };
};

const totem = (hooks: BattleArmyHooks, cell = at(3, 3)) => new Butchery(cell).toAllied(grid as never, hooks);

describe("Butchery", () => {
	const blueprint = new ButcheryBlueprint({});

	it("is a Rare at 25 gold that needs Dwarf science, casting every 6 s for no food", () => {
		expect(blueprint.rarity).toBe(Rarity.Rare);
		expect(blueprint.price).toBe(25);
		expect(requiredScienceOf(blueprint)).toBe(Science.Dwarf);
		expect(blueprint.stats.castSpeed).toBeCloseTo(castSpeedFromSeconds(6));
		expect(blueprint.stats.foodConsumptionOnCast).toBeNaN();
		expect(blueprint.tags).toEqual(expect.arrayContaining(["Totem", "Food"]));
	});

	it("has the oo / os layout with its star at the bottom right, mirrored for the opponent", () => {
		const cells = (list: Cell[]) => list.map(({ x, y }) => [x, y]);
		expect(cells(new Butchery(at(0, 0)).gridShape.cells)).toEqual([
			[0, 0],
			[0, 1],
			[1, 1],
		]);
		expect(cells(blueprint.patternEffect.getRelativeCells(BoardOrientation.Normal))).toEqual([[1, 0]]);
		expect(cells(blueprint.patternEffect.getRelativeCells(BoardOrientation.Mirrored))).toEqual([[-1, 0]]);
	});

	it("sacrifices one animal for 5 food and 3 buffs, leaving other units alone", () => {
		const { hooks, left, units, unitBuffs, towerBuffs, food } = setup([false, true, false]);
		totem(hooks).onCastResolve();
		expect(left).toEqual([units[0], units[2]]);
		expect(food).toEqual([5]);
		expect(unitBuffs.length + towerBuffs.length).toBe(3);
	});

	it("does nothing without an animal alive", () => {
		const { hooks, left, unitBuffs, towerBuffs, food } = setup([false]);
		totem(hooks).onCastResolve();
		expect(left).toHaveLength(1);
		expect(food).toEqual([]);
		expect(unitBuffs.length + towerBuffs.length).toBe(0);
		totem(setup([]).hooks).onCastResolve();
	});

	it("draws its buffs with replacement from the four army buffs, and reaches all of them", () => {
		const seen = new Set<string>();
		for (let seed = 1; seed <= 60; seed++) {
			const { hooks, unitBuffs, towerBuffs } = setup([true], seed);
			totem(hooks).onCastResolve();
			unitBuffs.forEach((b) => seen.add(`unit:${b}`));
			towerBuffs.forEach((b) => seen.add(`tower:${b}`));
		}
		expect([...seen].sort()).toEqual(
			["tower:cast-speed", "tower:projectile-damage", "unit:movement-speed", "unit:vitality"].sort(),
		);
	});

	it("can repeat a buff in one sacrifice", () => {
		const repeats = Array.from({ length: 60 }, (_, i) => {
			const { hooks, unitBuffs, towerBuffs } = setup([true], i + 1);
			totem(hooks).onCastResolve();
			const all = [...unitBuffs.map((b) => `u${b}`), ...towerBuffs.map((b) => `t${b}`)];
			return new Set(all).size < 3;
		});
		expect(repeats.some(Boolean)).toBe(true);
	});

	it("picks the same animal and buffs with the same seed, and varies with it", () => {
		const run = (seed: number) => {
			const { hooks, left, units, unitBuffs, towerBuffs } = setup(Array(6).fill(true), seed);
			totem(hooks).onCastResolve();
			return `${units.findIndex((a) => !left.includes(a))}|${unitBuffs}|${towerBuffs}`;
		};
		expect(run(42)).toBe(run(42));
		expect(new Set([1, 2, 3, 4, 5, 6, 7, 8].map(run)).size).toBeGreaterThan(1);
	});

	describe("star", () => {
		it("lights only for a barrack holding an Animal unit, in the shop", () => {
			const lights = (unit: Fox | Ent | null) => {
				const recruit = new RushBarrack(at(4, 3));
				recruit.setUnit(unit);
				return blueprint.patternCondition(recruit);
			};
			expect(lights(new Fox(at(0, 0)))).toBe(true);
			expect(lights(new Ent(at(0, 0)))).toBe(false);
			expect(lights(null)).toBe(false);
			expect(blueprint.patternCondition(new Ent(at(4, 3)) as never)).toBe(false);
			expect(blueprint.patternCondition(undefined)).toBe(false);
		});

		// A real Rush barrack (production speed 1.2) bonded to a Fox, or to an Ent when it is not an animal.
		const barrack = (animal: boolean, hooks: BattleArmyHooks) => {
			const recruit = new RushBarrack(at(4, 3));
			recruit.unitRecruit = animal ? new Fox(at(0, 0)) : new Ent(at(0, 0));
			return recruit.toAllied(grid as never, hooks);
		};
		const place = (animal: boolean, key = "4,3") => {
			const board: Record<string, object> = {};
			const { hooks } = setup([], 1, board);
			const rush = barrack(animal, hooks);
			board[key] = rush;
			return { hooks, rush };
		};

		it("adds 0.1 production speed to the animal barrack on it, on top of its own (Rush 1.2 -> 1.3)", () => {
			const { hooks, rush } = place(true);
			expect(rush.stats.castSpeed).toBeCloseTo(1.2);
			totem(hooks).onBattleStart();
			expect(rush.stats.castSpeed).toBeCloseTo(1.3);
		});

		it("adds to the barrack's percent bonuses without multiplying", () => {
			const { hooks, rush } = place(true);
			rush.stats.basePercentStat.castSpeed += 10;
			totem(hooks).onBattleStart();
			expect(rush.stats.castSpeed).toBeCloseTo(1.3 * 1.1);
		});

		it("does nothing for a barrack that does not produce an animal, or for another piece", () => {
			const { hooks, rush } = place(false);
			totem(hooks).onBattleStart();
			expect(rush.stats.castSpeed).toBeCloseTo(1.2);
			totem(setup([], 1, { "4,3": new Ent(at(4, 3)) }).hooks).onBattleStart();
			totem(setup([]).hooks).onBattleStart();
		});

		it("reads its star through the mirrored pattern on the opponent board", () => {
			const flipped = BattleGrid.flip(grid as never, at(6, 6));
			const { hooks, rush } = place(true, `${flipped.x - 1},${flipped.y}`);
			new Butchery(at(6, 6)).toEnemy(grid as never, hooks).onBattleStart();
			expect(rush.stats.castSpeed).toBeCloseTo(1.3);
		});
	});
});
