// Loaded first: the projectile modules run into the engine's grid <-> render traits import cycle otherwise.
import "../../../match-maker/board-serializer";
import { GridPosition } from "../../../../shared/position";
import type { BattleArmyHooks } from "../../../army/battle/battle-army";
import { EmberSpark } from "../../blueprint/implementation/ember-spark";
import { BattleSparkShot } from "./battle-spark-shot";

type Enemy = {
	position: GridPosition;
	alive: boolean;
	hits: number[];
	isAlive: () => boolean;
	takeHit: (damage: number) => void;
};

const enemy = (x: number, y: number, alive = true): Enemy => {
	const unit: Enemy = {
		position: new GridPosition({ x, y }),
		alive,
		hits: [],
		isAlive: () => unit.alive,
		takeHit: (damage) => unit.hits.push(damage),
	};
	return unit;
};

// Enemies within 2 units of the spark are touched.
const setup = (enemies: Enemy[], direction = new GridPosition({ x: -1, y: 0 }), range = 20) => {
	const removed: unknown[] = [];
	const hooks = {
		searchEnemyInArea: (area: GridPosition) =>
			enemies.filter((found) => Math.hypot(found.position.x - area.x, found.position.y - area.y) <= 2),
		removeProjectile: (projectile: unknown) => removed.push(projectile),
	} as unknown as BattleArmyHooks;
	const spark = new BattleSparkShot(new EmberSpark(1.5), new GridPosition({ x: 30, y: 10 }), hooks, 4, direction, range);
	return { spark, removed };
};

const run = (spark: BattleSparkShot, removed: unknown[]) => {
	let ticks = 0;
	while (removed.length === 0 && ticks < 200) {
		spark.tick();
		ticks++;
	}
	return ticks;
};

describe("BattleSparkShot", () => {
	it("flies straight along its direction", () => {
		const { spark } = setup([], new GridPosition({ x: 0, y: 1 }));

		spark.tick();

		expect(spark.position.x).toBeCloseTo(30);
		expect(spark.position.y).toBeCloseTo(11.5);
	});

	it("goes out once it has flown its range, not before", () => {
		const { spark, removed } = setup([], undefined, 20);

		const ticks = run(spark, removed);

		expect(removed).toEqual([spark]);
		expect(ticks).toBe(Math.ceil(20 / 1.5));
		// 20 units, in steps of 1.5: the last step is shortened so the spark ends exactly at its range.
		expect(spark.position.x).toBeCloseTo(30 - 20);
		expect(spark.travelled).toBeCloseTo(20);
	});

	it("hurts the enemy on its way by its damage, once, and goes out on it", () => {
		const onItsWay = enemy(20, 10);
		const { spark, removed } = setup([onItsWay]);

		const ticks = run(spark, removed);

		expect(onItsWay.hits).toEqual([4]);
		expect(removed).toEqual([spark]);
		expect(ticks).toBeLessThan(Math.ceil(20 / 1.5));
	});

	it("stops on the first enemy it meets, and spares the ones behind it", () => {
		const first = enemy(25, 10);
		const behind = enemy(15, 10);
		const { spark, removed } = setup([first, behind]);

		run(spark, removed);

		expect(first.hits).toEqual([4]);
		expect(behind.hits).toEqual([]);
	});

	it("goes through the dead to the first living enemy", () => {
		const dead = enemy(25, 10, false);
		const alive = enemy(15, 10);
		const { spark, removed } = setup([dead, alive]);

		run(spark, removed);

		expect(dead.hits).toEqual([]);
		expect(alive.hits).toEqual([4]);
	});

	it("leaves the enemies off its line alone", () => {
		const aside = enemy(20, 20);
		const beyond = enemy(5, 10);
		const { spark, removed } = setup([aside, beyond]);

		run(spark, removed);

		expect(aside.hits).toEqual([]);
		expect(beyond.hits).toEqual([]);
	});

	it("leaves the dead alone", () => {
		const dead = enemy(20, 10, false);
		const { spark, removed } = setup([dead]);

		run(spark, removed);

		expect(dead.hits).toEqual([]);
	});
});
