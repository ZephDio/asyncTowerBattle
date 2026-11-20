// Loaded first: the piece modules run into the engine's grid <-> render traits import cycle otherwise.
import "../../../../match-maker/board-serializer";
import { Cell, GridPosition } from "../../../../../shared/position";
import { BattleFoodEconomy } from "../../../../food/battle-food-economy";
import { UnitRecruitFixture } from "../../../../units/recruit/unit-fixtures";
import { RushBarrack } from "../../recruit/implementation/rush-barrack";
import { BasicBarrack } from "../../recruit/implementation/basic-barrack";
import { RUSH_BARRACK } from "../../blueprint/implementation/rush-barrack-tuning";
import type { BattleArmyHooks } from "../../../../army/battle/battle-army";
import type { AnyBattleUnit } from "../../../../units/battle/battle-unit";
import type { AnyBarrack } from "../../recruit/barrack";

// An army with just what a barrack and its units read: the path, the castle, the food and the spawned units, which
// join the army at once.
const setup = (options: { food?: number; barrack?: AnyBarrack } = {}) => {
	const food = new BattleFoodEconomy(options.food ?? 1000);
	const spawned: AnyBattleUnit[] = [];
	const unitAddedListeners: ((unit: AnyBattleUnit) => void)[] = [];
	const far = new GridPosition({ x: 1000, y: 0 });
	const hooks = {
		getEnemyPath: () => ({ getNodes: () => [far] }),
		getAlliedCastle: () => ({ position: new GridPosition({ x: 0, y: 0 }) }),
		getDefaultUnit: () => UnitRecruitFixture.dragon,
		alliedFoodHooks: food.getHooks(),
		alliedEconomyHooks: { getEconomy: () => ({ amount: 0 }) },
		addUnits: (unit: AnyBattleUnit) => {
			spawned.push(unit);
			for (const listener of unitAddedListeners) listener(unit);
		},
		getAlliedUnits: () => spawned,
		onUnitAdded: (listener: (unit: AnyBattleUnit) => void) => unitAddedListeners.push(listener),
		removeUnit: () => {},
	} as unknown as BattleArmyHooks;
	const recruit = options.barrack ?? new RushBarrack(new Cell({ x: 2, y: 1 }));
	recruit.setUnit(UnitRecruitFixture.dragon);
	const grid = { cellToGrid: (cell: Cell) => new GridPosition({ x: cell.x, y: cell.y }) };
	const barrack = recruit.toAllied(grid as never, hooks);
	return { barrack, spawned, food, hooks };
};

const ticksToFirstSummon = (barrack: AnyBarrack) => {
	const { barrack: battle, spawned } = setup({ barrack });
	let ticks = 0;
	while (spawned.length === 0) {
		battle.tick();
		ticks++;
	}
	return ticks;
};

const upkeep = UnitRecruitFixture.dragon.stats.foodConsumption;

describe("RushBarrack", () => {
	it("is a horizontal 2x1 piece anchored on its left cell", () => {
		const recruit = new RushBarrack(new Cell({ x: 2, y: 1 }));

		expect(recruit.gridShape.getOccupiedCellsFrom(new Cell({ x: 2, y: 1 }))).toEqual([
			new Cell({ x: 2, y: 1 }),
			new Cell({ x: 3, y: 1 }),
		]);
	});

	it("summons 1.2 times as fast as the basic barrack", () => {
		const rush = ticksToFirstSummon(new RushBarrack(new Cell({ x: 2, y: 1 })));
		const basic = ticksToFirstSummon(new BasicBarrack(new Cell({ x: 2, y: 1 })));

		expect(RUSH_BARRACK.castSpeed).toBe(1.2);
		expect(rush).toBe(Math.ceil(UnitRecruitFixture.dragon.stats.summonTime / 1.2));
		expect(basic).toBe(Math.ceil(UnitRecruitFixture.dragon.stats.summonTime));
	});

	it("makes every unit it summons eat 1 food more, without any status", () => {
		const { barrack, spawned } = setup();

		barrack.onCastResolve();
		barrack.onCastResolve();

		expect(spawned).toHaveLength(2);
		for (const unit of spawned) {
			expect(unit.stats.foodCost).toBeCloseTo(upkeep + RUSH_BARRACK.extraFoodPerUnit);
			expect(unit.stats.boons.size).toBe(0);
		}
	});
});

describe("The Rush Barrack's upkeep buff", () => {
	const summon = (food?: number) => {
		const { barrack, spawned, food: economy } = setup({ food });
		barrack.onCastResolve();
		const unit = spawned[0] as AnyBattleUnit;
		return { unit, food: economy };
	};

	it("drains the upkeep plus 1 food every 2 seconds while the unit lives", () => {
		const { unit, food } = summon(100);

		for (let tick = 0; tick < 64 * 3; tick++) unit.tick();

		expect(food.getFood()).toBeCloseTo(100 - 3 * (upkeep + 1));
	});

	it("starves the unit like any hungry unit when the army cannot pay the whole meal", () => {
		const { unit, food } = summon(upkeep + 0.5);
		const health = unit.stats.health;

		for (let tick = 0; tick < 64 * 2; tick++) unit.tick();

		// Nothing is eaten, and the hunger damage grows by 2 each missed meal: 2 then 4.
		expect(food.getFood()).toBeCloseTo(upkeep + 0.5);
		expect(unit.stats.health).toBeCloseTo(health - 6);
	});

	it("leaves the units of other barracks alone", () => {
		const { barrack, spawned } = setup({ barrack: new BasicBarrack(new Cell({ x: 2, y: 1 })) });

		barrack.onCastResolve();

		expect(spawned[0]?.stats.foodCost).toBeCloseTo(upkeep);
	});
});
