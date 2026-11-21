// Loaded first: the tower modules run into the engine's grid <-> render traits import cycle otherwise.
import "../../../../match-maker/board-serializer";
import { Cell, GridPosition } from "../../../../../shared/position";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";
import { STANDARD_CELL_SIZE } from "../../../../grid/tgrid";
import { castSpeedFromSeconds } from "../../../../../shared/seconds";
import { MagicLighthouse } from "../../recruit/implementation/magic-lighthouse";
import { MagicLighthouseBlueprint } from "../../blueprint/implementation/magic-lighthouse-blueprint";
import { BattleMagicLighthouse } from "./battle-magic-lighthouse";
import { LighthouseBeam } from "../../../../area-effect/implementation/lighthouse-beam";
import { Rarity } from "../../../../../shared/traits/engine/rarity";
import type { BattleArmyHooks } from "../../../../army/battle/battle-army";
import type { AnyBattleUnit } from "../../../../units/battle/battle-unit";
import type { TowerBuff } from "../../../../army/battle/army-buff";

const at = (cell: Cell) =>
	new GridPosition({ x: (cell.x + 0.5) * STANDARD_CELL_SIZE, y: (cell.y + 0.5) * STANDARD_CELL_SIZE });
const cellOf = (position: GridPosition) =>
	new Cell({ x: Math.floor(position.x / STANDARD_CELL_SIZE), y: Math.floor(position.y / STANDARD_CELL_SIZE) });

// The order the enemies got hit in, over the whole test.
let hitLog: FakeEnemy[] = [];

class FakeEnemy {
	alive = true;
	hits: number[] = [];

	constructor(public position: GridPosition) {}

	get cell() {
		return cellOf(this.position);
	}

	isAlive() {
		return this.alive;
	}

	takeHit(damage: number) {
		this.hits.push(damage);
		hitLog.push(this);
	}
}

// The lighthouse at (5, 5) lights, as built:
//   x s s s x      row 7
//   s x o x s      row 6
//   s x o x s      row 5
//   x s s s x      row 4
//  col 3 ... 7
const LEFT = [new Cell({ x: 3, y: 5 }), new Cell({ x: 3, y: 6 })];
const TOP = [new Cell({ x: 4, y: 7 }), new Cell({ x: 5, y: 7 }), new Cell({ x: 6, y: 7 })];
const RIGHT = [new Cell({ x: 7, y: 6 }), new Cell({ x: 7, y: 5 })];
const BOTTOM = [new Cell({ x: 6, y: 4 }), new Cell({ x: 5, y: 4 }), new Cell({ x: 4, y: 4 })];
const NEVER = [
	[4, 5],
	[4, 6],
	[6, 5],
	[6, 6],
	[3, 7],
	[7, 7],
	[3, 4],
	[7, 4],
].map(([x, y]) => new Cell({ x: x ?? 0, y: y ?? 0 }));

// A battle army with just what the lighthouse reads: the enemy units, the area effects it adds, the food and the buffs.
const setup = (options: { food?: number; orientation?: BoardOrientation; cell?: Cell } = {}) => {
	const enemies: FakeEnemy[] = [];
	const beams: LighthouseBeam[] = [];
	const buffs: [TowerBuff, number][] = [];
	const food = { left: options.food ?? 1000, spent: 0 };
	const hooks = {
		searchTarget: (_position: GridPosition, criteria: (unit: AnyBattleUnit, distance: number) => boolean) => {
			for (const enemy of [...enemies]) criteria(enemy as unknown as AnyBattleUnit, 0);
			return null;
		},
		addAreaEffect: (beam: LighthouseBeam) => beams.push(beam),
		removeAreaEffect: (beam: LighthouseBeam) => beams.splice(beams.indexOf(beam), 1),
		gridHooks: { getRealPosition: at, getCell: cellOf },
		alliedFoodHooks: {
			consumeFood: (amount: number) => {
				if (food.left < amount) return false;
				food.left -= amount;
				food.spent += amount;
				return true;
			},
		},
		alliedArmyBuffHooks: {
			addTowerBuff: (buff: TowerBuff, amount: number) => buffs.push([buff, amount]),
		},
	} as unknown as BattleArmyHooks;
	const orientation = options.orientation ?? BoardOrientation.Normal;
	const cell = options.cell ?? new Cell({ x: 5, y: 5 });
	const recruit = new MagicLighthouse(cell);
	const tower = new BattleMagicLighthouse(recruit, hooks, recruit.position, cell, orientation);
	const enemyOn = (cell: Cell) => {
		const enemy = new FakeEnemy(at(cell));
		enemies.push(enemy);
		return enemy;
	};
	// Ticks the beams on until they are all gone.
	const sweep = () => {
		for (let tick = 0; beams.length && tick < 1000; tick++) for (const beam of [...beams]) beam.tick();
	};
	// One cast, and its beams swept to the end.
	const cast = () => {
		tower.onCastResolve();
		sweep();
	};
	hitLog = [];
	return { tower, recruit, beams, buffs, food, enemyOn, sweep, cast, enemies };
};

const coords = (cells: Cell[]) => cells.map(({ x, y }) => [x, y]);

describe("MagicLighthouse", () => {
	describe("blueprint", () => {
		it("is a vertical 1x2 piece, anchored on its bottom cell", () => {
			const { recruit } = setup();

			expect(coords(recruit.gridShape.getOccupiedCellsFrom(new Cell({ x: 5, y: 5 })))).toEqual([
				[5, 5],
				[5, 6],
			]);
		});

		it("casts every 2 seconds for 2.5 food, and hurts by 7", () => {
			const { stats } = new MagicLighthouseBlueprint({});

			expect(stats.castSpeed).toBe(castSpeedFromSeconds(2));
			expect(stats.foodConsumptionOnCast).toBe(2.5);
			expect(stats.projectileDamage).toBe(7);
		});

		it("is an uncommon tower for 20 gold", () => {
			const blueprint = new MagicLighthouseBlueprint({});

			expect(blueprint.rarity).toBe(Rarity.Uncommon);
			expect(blueprint.price).toBe(20);
			expect(blueprint.description.name).toBe("Magic Lighthouse");
		});

		it("targets the 10 beam cells, so the shop shows them", () => {
			const { tower } = setup();

			const zone = coords(tower.targetZone.getRelativeCells(BoardOrientation.Normal));

			expect(zone).toHaveLength(10);
			expect(zone).toEqual(
				expect.arrayContaining([
					[-2, 0],
					[-2, 1],
					[-1, 2],
					[0, 2],
					[1, 2],
					[2, 1],
					[2, 0],
					[1, -1],
					[0, -1],
					[-1, -1],
				]),
			);
		});
	});

	describe("beams", () => {
		it("hits 3 enemies on the left and 1 on the right for 7 each with the first cast, for 2.5 food", () => {
			const { cast, enemyOn, food } = setup();
			const lefts = [enemyOn(LEFT[0] as Cell), enemyOn(LEFT[0] as Cell), enemyOn(LEFT[1] as Cell)];
			const right = enemyOn(RIGHT[1] as Cell);

			cast();

			for (const enemy of [...lefts, right]) expect(enemy.hits).toEqual([7]);
			expect(food.spent).toBe(2.5);
		});

		it("alternates: left and right, then top and bottom, then left and right again", () => {
			const { cast, enemyOn } = setup();
			const sides = [...LEFT, ...RIGHT].map(enemyOn);
			const topBottom = [...TOP, ...BOTTOM].map(enemyOn);

			cast();
			expect(sides.map((enemy) => enemy.hits.length)).toEqual(sides.map(() => 1));
			expect(topBottom.map((enemy) => enemy.hits.length)).toEqual(topBottom.map(() => 0));

			cast();
			expect(sides.map((enemy) => enemy.hits.length)).toEqual(sides.map(() => 1));
			expect(topBottom.map((enemy) => enemy.hits.length)).toEqual(topBottom.map(() => 1));

			cast();
			expect(sides.map((enemy) => enemy.hits.length)).toEqual(sides.map(() => 2));
			expect(topBottom.map((enemy) => enemy.hits.length)).toEqual(topBottom.map(() => 1));
		});

		it.each([
			["left, bottom to top", LEFT, 0],
			["right, top to bottom", RIGHT, 0],
			["top, left to right", TOP, 1],
			["bottom, right to left", BOTTOM, 1],
		])("sweeps clockwise: %s", (_name, cells, castsBefore) => {
			const { cast, enemyOn } = setup();
			for (let i = 0; i < castsBefore; i++) cast();
			// Placed in reverse, so the search order can't be what orders the hits.
			const enemies = [...cells].reverse().map(enemyOn).reverse();

			cast();

			expect(hitLog.filter((enemy) => enemies.includes(enemy))).toEqual(enemies);
		});

		it("sweeps a side in about 0.3 s: the last cell lights a few ticks after the first", () => {
			const { tower, beams, enemyOn } = setup();
			const first = enemyOn(LEFT[0] as Cell);
			const last = enemyOn(LEFT[1] as Cell);

			tower.onCastResolve();
			const left = beams[0] as LighthouseBeam;
			let tick = 0;
			const hitAt = new Map<FakeEnemy, number>();
			for (; beams.length; tick++) {
				for (const beam of [...beams]) beam.tick();
				for (const enemy of [first, last]) if (enemy.hits.length && !hitAt.has(enemy)) hitAt.set(enemy, tick);
			}

			expect(left.cells).toHaveLength(2);
			expect(hitAt.get(first)).toBe(0);
			expect(hitAt.get(last)).toBe(5);
		});

		it("never hits an enemy on a cell next to the tower or in a corner", () => {
			const { cast, enemyOn } = setup();
			const spared = NEVER.map(enemyOn);

			for (let i = 0; i < 6; i++) cast();

			for (const enemy of spared) expect(enemy.hits).toEqual([]);
		});

		it("hits each enemy once per beam, even one walking along the sweep", () => {
			const { tower, beams, enemyOn } = setup();
			const walker = enemyOn(LEFT[0] as Cell);

			tower.onCastResolve();
			for (const beam of [...beams]) beam.tick();
			walker.position = at(LEFT[1] as Cell);
			for (let tick = 0; beams.length; tick++) for (const beam of [...beams]) beam.tick();

			expect(walker.hits).toEqual([7]);
		});

		it("leaves the dead alone", () => {
			const { cast, enemyOn } = setup();
			const dead = enemyOn(LEFT[0] as Cell);
			dead.alive = false;

			cast();

			expect(dead.hits).toEqual([]);
		});

		it("hurts by the tower's live projectile damage, raised by the army tower damage buff", () => {
			const { tower, cast, enemyOn } = setup();
			const enemy = enemyOn(LEFT[0] as Cell);
			tower.applyBuff("projectile-damage", 1);

			cast();

			expect(tower.stats.projectileDamage).toBeGreaterThan(7);
			expect(enemy.hits).toEqual([tower.stats.projectileDamage]);
		});

		it("draws its streak along the sweep and goes away after a short fade", () => {
			const { tower, beams } = setup();

			tower.onCastResolve();
			const left = beams[0] as LighthouseBeam;
			const start = left.position.y;
			left.tick();

			expect(left.position.y).toBeGreaterThan(start);
			expect(left.position.x).toBeCloseTo(at(LEFT[0] as Cell).x);
		});
	});

	describe("food", () => {
		it("still costs 2.5 food with no enemy around, and lights two beams", () => {
			const { tower, food, beams } = setup();

			tower.onCastResolve();

			expect(food.spent).toBe(2.5);
			expect(beams).toHaveLength(2);
		});

		it("lights nothing with less than 2.5 food", () => {
			const { cast, tower, beams, enemyOn, food } = setup({ food: 2 });
			const enemy = enemyOn(LEFT[0] as Cell);

			tower.onCastResolve();
			expect(beams).toHaveLength(0);
			cast();

			expect(enemy.hits).toEqual([]);
			expect(food.spent).toBe(0);
		});
	});

	describe("casting", () => {
		it("casts every 2 s (64 ticks), whether enemies are there or not", () => {
			const { tower, food } = setup();

			for (let tick = 0; tick < 64 * 3 + 2; tick++) tower.tick();

			expect(food.spent).toBe(2.5 * 3);
		});
	});

	describe("army damage buff", () => {
		const crowd = (enemyOn: (cell: Cell) => FakeEnemy, count: number) =>
			Array.from({ length: count }, () => enemyOn(LEFT[0] as Cell));

		it("gives nothing for 9 distinct enemies", () => {
			const { cast, enemyOn, buffs } = setup();
			crowd(enemyOn, 9);

			cast();

			expect(buffs).toEqual([]);
		});

		it("gives +1 tower projectile damage for 10 distinct enemies", () => {
			const { cast, enemyOn, buffs, tower } = setup();
			crowd(enemyOn, 10);

			cast();

			expect(buffs).toEqual([["projectile-damage", 1]]);
			expect(tower.enemiesLit).toBe(10);
		});

		it("doesn't count an enemy hit again, and gives +2 at 20", () => {
			const { cast, enemyOn, buffs, tower } = setup();
			crowd(enemyOn, 10);
			cast();
			cast();
			cast();
			expect(buffs).toHaveLength(1);
			expect(tower.enemiesLit).toBe(10);

			crowd(enemyOn, 10);
			// Top and bottom, then left and right again.
			cast();
			cast();

			expect(buffs).toEqual([
				["projectile-damage", 1],
				["projectile-damage", 1],
			]);
			expect(tower.enemiesLit).toBe(20);
		});

		it("counts distinct enemies over every side", () => {
			const { cast, enemyOn, buffs } = setup();
			[...LEFT, ...RIGHT, ...TOP, ...BOTTOM].map(enemyOn);

			cast();
			expect(buffs).toEqual([]);
			cast();

			expect(buffs).toEqual([["projectile-damage", 1]]);
		});
	});

	describe("mirrored, on the opponent's board", () => {
		const mirrored = (cells: Cell[]) => cells.map((cell) => new Cell({ x: 5 - (cell.x - 5), y: 5 - (cell.y - 5) }));

		it("lights the point mirrored cells, sweeping clockwise on screen too", () => {
			const { cast, enemyOn } = setup({ orientation: BoardOrientation.Mirrored });
			const left = mirrored(LEFT).map(enemyOn);
			const right = mirrored(RIGHT).map(enemyOn);
			const unlit = [...LEFT, ...RIGHT]
				.filter((cell) => !mirrored([...LEFT, ...RIGHT]).some((m) => m.x === cell.x && m.y === cell.y))
				.map(enemyOn);

			cast();

			for (const enemy of [...left, ...right]) expect(enemy.hits).toEqual([7]);
			for (const enemy of unlit) expect(enemy.hits).toEqual([]);
			// The mirrored left beam goes from (7, 5) down to (7, 4): top to bottom on the right of the screen.
			expect(coords(left.map((enemy) => enemy.cell))).toEqual([
				[7, 5],
				[7, 4],
			]);
			expect(hitLog.filter((enemy) => left.includes(enemy))).toEqual(left);
		});

		it("never hits the mirrored never-lit cells", () => {
			const { cast, enemyOn } = setup({ orientation: BoardOrientation.Mirrored });
			const spared = mirrored(NEVER).map(enemyOn);

			for (let i = 0; i < 4; i++) cast();

			for (const enemy of spared) expect(enemy.hits).toEqual([]);
		});
	});

	describe("description", () => {
		it("counts the distinct enemies lit, live during the battle", () => {
			const { tower, cast, enemyOn } = setup();
			enemyOn(LEFT[0] as Cell);
			enemyOn(RIGHT[0] as Cell);

			cast();

			const lines = tower.liveDescription();
			expect(lines[lines.length - 1]).toEqual(["Enemies lit: ", { value: "2", trend: "better" }]);
		});

		it("starts at 0 in the shop", () => {
			const { recruit } = setup();

			expect(recruit.description.description.at(-1)).toBe("Enemies lit: 0");
		});
	});
});
