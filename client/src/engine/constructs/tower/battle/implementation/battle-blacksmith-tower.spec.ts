// Loaded first: the tower modules run into the engine's grid <-> render traits import cycle otherwise.
import "../../../../match-maker/board-serializer";
import { Derive } from "@ddd-ts/traits";
import { Tagged, type Tag } from "../../../../../shared/traits/engine/tags/tagged";
import { Cell, GridPosition } from "../../../../../shared/position";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";
import { STANDARD_CELL_SIZE } from "../../../../grid/tgrid";
import { Stats } from "../../../../stats/stats";
import { castSpeedFromSeconds } from "../../../../../shared/seconds";
import { BlacksmithTower } from "../../recruit/implementation/blacksmith-tower";
import { BlacksmithTowerBlueprint } from "../../blueprint/implementation/blacksmith-tower-blueprint";
import { BattleBlacksmithTower } from "./battle-blacksmith-tower";
import type { BattleSparkShot } from "../../../../projectile/battle/implementation/battle-spark-shot";
import type { BattleArmyHooks } from "../../../../army/battle/battle-army";
import type { AnyBattleUnit } from "../../../../units/battle/battle-unit";

// Units are told apart by their tags, which only trait carrying objects have, so the fakes are tagged.
class FakeUnit extends Derive(Tagged) {
	stats: Stats;
	alive = true;
	hits: number[] = [];

	constructor(
		public position: GridPosition,
		tags: Tag[],
		maxHealth: number,
	) {
		super({});
		this.tags = tags;
		this.stats = new Stats(maxHealth, 0, 0, 0, 0, 0, 0, 0, () => {});
	}

	isAlive() {
		return this.alive;
	}

	takeHit(damage: number) {
		this.hits.push(damage);
	}
}

const at = (cell: Cell) =>
	new GridPosition({ x: (cell.x + 0.5) * STANDARD_CELL_SIZE, y: (cell.y + 0.5) * STANDARD_CELL_SIZE });
const cellOf = (position: GridPosition) =>
	new Cell({ x: Math.floor(position.x / STANDARD_CELL_SIZE), y: Math.floor(position.y / STANDARD_CELL_SIZE) });

const fakeUnit = (cell: Cell, tags: Tag[] = [], maxHealth = 10) => new FakeUnit(at(cell), tags, maxHealth);

// A battle army with just what the tower reads: the seeded random, the projectiles it throws, the food, and the units.
const setup = (options: { food?: number; orientation?: BoardOrientation; cell?: Cell; random?: () => number } = {}) => {
	const allies: FakeUnit[] = [];
	const projectiles: BattleSparkShot[] = [];
	const listeners: ((unit: AnyBattleUnit) => void)[] = [];
	const food = { left: options.food ?? 1000, spent: 0 };
	const hooks = {
		random: options.random ?? seededRandom(1),
		onUnitAdded: (listener: (unit: AnyBattleUnit) => void) => listeners.push(listener),
		getAlliedUnits: () => allies,
		addProjectile: (projectile: BattleSparkShot) => projectiles.push(projectile),
		gridHooks: {
			getRealPosition: at,
			getCell: cellOf,
			// The directions of the army: the enemy's are turned around.
			getRelativeDirection: () =>
				options.orientation === BoardOrientation.Mirrored
					? { above: new GridPosition({ x: 0, y: -1 }), left: new GridPosition({ x: 1, y: 0 }) }
					: { above: new GridPosition({ x: 0, y: 1 }), left: new GridPosition({ x: -1, y: 0 }) },
		},
		alliedFoodHooks: {
			consumeFood: (amount: number) => {
				if (food.left < amount) return false;
				food.left -= amount;
				food.spent += amount;
				return true;
			},
		},
	} as unknown as BattleArmyHooks;
	const orientation = options.orientation ?? BoardOrientation.Normal;
	const cell = options.cell ?? new Cell({ x: 5, y: 5 });
	const recruit = new BlacksmithTower(cell);
	const tower = new BattleBlacksmithTower(recruit, hooks, recruit.position, cell, orientation);
	const addAlly = (unit: FakeUnit) => {
		allies.push(unit);
		for (const listener of listeners) listener(unit as unknown as AnyBattleUnit);
	};
	return { tower, projectiles, addAlly, food, recruit, blueprint: recruit.tower };
};

// A small deterministic generator, like the battle's seeded one.
const seededRandom = (seed: number) => {
	let state = seed;
	return () => {
		state = (state * 1664525 + 1013904223) % 4294967296;
		return state / 4294967296;
	};
};

const cells = (...coords: [number, number][]) => coords.map(([x, y]) => new Cell({ x, y }));

describe("BlacksmithTower", () => {
	it("is a horizontal 2x1 piece", () => {
		const { recruit } = setup();

		expect(recruit.gridShape.getOccupiedCellsFrom(new Cell({ x: 5, y: 5 }))).toEqual(cells([5, 5], [6, 5]));
	});

	it("casts every 1.5 seconds", () => {
		expect(new BlacksmithTowerBlueprint({}).stats.castSpeed).toBe(castSpeedFromSeconds(1.5));
	});

	it("has the zone of the design: the three cells on the left of the piece", () => {
		const { tower } = setup();

		const zone = tower.targetZone.getRelativeCells(BoardOrientation.Normal).map(({ x, y }) => [x, y]);

		expect(zone).toEqual([
			[-1, 1],
			[-1, 0],
			[-1, -1],
		]);
	});

	describe("volley", () => {
		const UP = 59;
		const DOWN = 71;
		const CONE = UP + DOWN;
		// The angle of a spark from the direction of "left", in degrees.
		const angleFromLeft = (spark: BattleSparkShot, left: number) => {
			const degrees = (spark.orientation * 180) / Math.PI - left;
			return ((((degrees + 180) % 360) + 360) % 360) - 180;
		};

		it("shoots 7 sparks at each cast, with no enemy around", () => {
			const { tower, projectiles } = setup();

			tower.onCastResolve();

			expect(projectiles).toHaveLength(7);
			tower.onCastResolve();
			expect(projectiles).toHaveLength(14);
		});

		it("shoots them all from the anvil, on the left of and above the left cell", () => {
			const { tower, projectiles, blueprint } = setup();

			tower.onCastResolve();

			const center = at(new Cell({ x: 5, y: 5 }));
			const { left, above } = blueprint.anvilOffset;
			for (const spark of projectiles) {
				expect(spark.position.x).toBeCloseTo(center.x - left);
				expect(spark.position.y).toBeCloseTo(center.y + above);
			}
		});

		it("opens in a cone toward the left, 59 degrees up and 71 degrees down", () => {
			const { tower, projectiles } = setup();

			for (let cast = 0; cast < 30; cast++) tower.onCastResolve();

			const angles = projectiles.map((spark) => angleFromLeft(spark, 180));
			for (const angle of angles) {
				expect(angle).toBeGreaterThanOrEqual(-UP);
				expect(angle).toBeLessThanOrEqual(DOWN);
			}
			// Spread over the whole cone, not all aimed at the same place.
			expect(Math.min(...angles)).toBeLessThan(-UP + CONE / 6);
			expect(Math.max(...angles)).toBeGreaterThan(DOWN - CONE / 6);
		});

		it("fans the 7 sparks out evenly: each one takes a random direction in its own slice of the cone", () => {
			const { tower, projectiles } = setup();

			for (let cast = 0; cast < 20; cast++) tower.onCastResolve();

			projectiles.forEach((spark, index) => {
				const slice = index % 7;
				const offset = angleFromLeft(spark, 180);
				expect(offset).toBeGreaterThanOrEqual(-UP + (slice / 7) * CONE - 1e-9);
				expect(offset).toBeLessThanOrEqual(-UP + ((slice + 1) / 7) * CONE + 1e-9);
			});
			// Random inside the slice: the same slice isn't always hit at the same angle.
			const firstSlice = projectiles.filter((_, index) => index % 7 === 0).map((spark) => spark.orientation);
			expect(new Set(firstSlice).size).toBeGreaterThan(1);
		});

		it("gives every spark its own range, within the limits", () => {
			const { tower, projectiles, blueprint } = setup();

			for (let cast = 0; cast < 10; cast++) tower.onCastResolve();

			const { minSparkRange, maxSparkRange } = blueprint;
			const ranges = projectiles.map((spark) => spark.range / STANDARD_CELL_SIZE);
			for (const range of ranges) {
				expect(range).toBeGreaterThanOrEqual(minSparkRange);
				expect(range).toBeLessThanOrEqual(maxSparkRange);
			}
			expect(new Set(ranges).size).toBeGreaterThan(1);
		});

		it("throws the same cone on a replay with the same seed", () => {
			const first = setup({ random: seededRandom(7) });
			const replay = setup({ random: seededRandom(7) });

			first.tower.onCastResolve();
			replay.tower.onCastResolve();

			const shape = (spark: BattleSparkShot) => [spark.orientation, spark.range];
			expect(first.projectiles.map(shape)).toEqual(replay.projectiles.map(shape));
		});

		it("throws another cone with another seed", () => {
			const first = setup({ random: seededRandom(7) });
			const other = setup({ random: seededRandom(8) });

			first.tower.onCastResolve();
			other.tower.onCastResolve();

			expect(first.projectiles.map((spark) => spark.orientation)).not.toEqual(
				other.projectiles.map((spark) => spark.orientation),
			);
		});

		it("hurts by the tower's projectile damage", () => {
			const { tower, projectiles } = setup();

			tower.onCastResolve();

			for (const spark of projectiles) expect(spark.damage).toBe(tower.stats.projectileDamage);
		});

		it("opens toward the right when mirrored, from the anvil turned around", () => {
			const { tower, projectiles, blueprint } = setup({ orientation: BoardOrientation.Mirrored });

			for (let cast = 0; cast < 10; cast++) tower.onCastResolve();

			const center = at(new Cell({ x: 5, y: 5 }));
			const { left, above } = blueprint.anvilOffset;
			for (const spark of projectiles) {
				const offset = angleFromLeft(spark, 0);
				expect(offset).toBeGreaterThanOrEqual(-UP);
				expect(offset).toBeLessThanOrEqual(DOWN);
				expect(spark.position.x).toBeCloseTo(center.x + left);
				expect(spark.position.y).toBeCloseTo(center.y - above);
			}
		});
	});

	describe("food", () => {
		it("costs food at each volley", () => {
			const { tower, food } = setup();

			tower.onCastResolve();

			expect(food.spent).toBe(tower.stats.foodCost);
		});

		it("throws nothing without the food", () => {
			const { tower, projectiles } = setup({ food: 0 });

			tower.onCastResolve();

			expect(projectiles).toHaveLength(0);
		});
	});

	describe("casting", () => {
		const ticks = (tower: BattleBlacksmithTower, count: number) => {
			for (let tick = 0; tick < count; tick++) tower.tick();
		};

		it("finishes its casts, and throws a volley each time", () => {
			const { tower, projectiles } = setup();

			ticks(tower, 48 * 3 + 2);

			expect(projectiles).toHaveLength(7 * 3);
		});

		it("gives Kinfolk health on the fourth cast of 1.5 s (48 ticks)", () => {
			const { tower } = setup();

			ticks(tower, 48 * 3 + 2);
			expect(tower.kinfolkHealth).toBe(0);
			ticks(tower, 48);
			expect(tower.kinfolkHealth).toBe(1);
		});
	});

	describe("Kinfolk max health", () => {
		const casts = (tower: BattleBlacksmithTower, count: number) => {
			for (let cast = 0; cast < count; cast++) tower.onCastResolve();
		};

		it("starts at 0", () => {
			const { tower, addAlly } = setup();
			const kinfolk = fakeUnit(new Cell({ x: 0, y: 0 }), ["Kinfolk"]);

			addAlly(kinfolk);
			casts(tower, 3);

			expect(tower.kinfolkHealth).toBe(0);
			expect(kinfolk.stats.maxHealth).toBeCloseTo(10);
		});

		it.each([
			[3, 0],
			[4, 1],
			[7, 1],
			[8, 2],
			[12, 3],
		])("after %i casts it gives %i", (count, given) => {
			const { tower } = setup();

			casts(tower, count);

			expect(tower.kinfolkHealth).toBe(given);
		});

		it("raises the max health and health of the Kinfolk units already there", () => {
			const { tower, addAlly } = setup();
			const kinfolk = fakeUnit(new Cell({ x: 0, y: 0 }), ["Kinfolk"]);
			addAlly(kinfolk);

			casts(tower, 8);

			expect(kinfolk.stats.maxHealth).toBeCloseTo(12);
			expect(kinfolk.stats.health).toBeCloseTo(12);
		});

		it("gives units that join later the value reached so far, once", () => {
			const { tower, addAlly } = setup();
			casts(tower, 8);
			const late = fakeUnit(new Cell({ x: 0, y: 0 }), ["Kinfolk"]);

			addAlly(late);

			expect(late.stats.maxHealth).toBeCloseTo(12);
			casts(tower, 4);
			expect(late.stats.maxHealth).toBeCloseTo(13);
		});

		it("scales with the unit's own base health in the same flat amount", () => {
			const { tower, addAlly } = setup();
			const sturdy = fakeUnit(new Cell({ x: 0, y: 0 }), ["Kinfolk"], 50);
			addAlly(sturdy);

			casts(tower, 4);

			expect(sturdy.stats.maxHealth).toBeCloseTo(51);
		});

		it("leaves the units without the Kinfolk tag alone", () => {
			const { tower, addAlly } = setup();
			const animal = fakeUnit(new Cell({ x: 0, y: 0 }), ["Animal"]);
			addAlly(animal);

			casts(tower, 8);
			const late = fakeUnit(new Cell({ x: 0, y: 0 }), ["Animal"]);
			addAlly(late);

			expect(animal.stats.maxHealth).toBeCloseTo(10);
			expect(late.stats.maxHealth).toBeCloseTo(10);
		});

		it("counts a cast that couldn't pay", () => {
			const { tower } = setup({ food: 0 });

			casts(tower, 4);

			expect(tower.kinfolkHealth).toBe(1);
		});
	});

	describe("description", () => {
		it("says 0 before the battle", () => {
			const { recruit } = setup();

			expect(recruit.description.description).toEqual([
				"Your Kinfolk units",
				"receive 0💚,",
				"increase this value",
				"by 1 every 4 casts",
			]);
		});

		it("follows the live value during the battle, in green once it is above 0", () => {
			const { tower } = setup();
			for (let cast = 0; cast < 4; cast++) tower.onCastResolve();

			const lines = tower.liveDescription();

			expect(lines[1]).toEqual(["receive ", { value: "1", trend: "better" }, "💚,"]);
		});

		it("stays neutral at 0", () => {
			const { tower } = setup();

			expect(tower.liveDescription()[1]).toEqual(["receive ", { value: "0", trend: "neutral" }, "💚,"]);
		});
	});
});
