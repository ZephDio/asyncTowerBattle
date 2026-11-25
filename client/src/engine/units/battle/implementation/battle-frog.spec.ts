// Loaded first: the piece modules run into the engine's grid <-> render traits import cycle otherwise.
import "../../../match-maker/board-serializer";
import { Cell, GridPosition } from "../../../../shared/position";
import { ArmyBuff } from "../../../army/battle/army-buff";
import { Rarity } from "../../../../shared/traits/engine/rarity";
import { Science } from "../../../../shared/traits/engine/science";
import { Stats } from "../../../stats/stats";
import { Frog } from "../../recruit/implementation/frog";
import { WitchHouse } from "../../../constructs/tower/recruit/implementation/witch-house";
import { Poisoned } from "../../../area-effect/implementation/poison-ground";
import { RetailFiller } from "../../../shop/retail/retail-filler";
import { FrogBlueprint } from "../../blueprint/implementation/frog-blueprint";
import { HOP_SPEED } from "./battle-frog";
import { movementSpeedToDistancePerTick } from "../../../../shared/seconds";
import type { BattleArmyHooks } from "../../../army/battle/battle-army";
import type { BattlePath } from "../../../path/battle/battle-path";
import type { AnyBattleUnit } from "../battle-unit";

class Enemy {
	stats = new Stats(100, 0, 0, 0, 0, 0, 0, 0, () => {});
	constructor(private alive = true) {}
	isAlive() {
		return this.alive;
	}
	addCondition(condition: Poisoned) {
		this.stats.addCondition(condition);
	}
}

const setup = (enemies: Enemy[], random = 0) => {
	const buffs = new ArmyBuff();
	const removed: unknown[] = [];
	const hooks = {
		alliedArmyBuffHooks: buffs.getHooks(),
		getEnemyUnits: () => enemies as unknown as AnyBattleUnit[],
		searchEnemyInArea: () => enemies as unknown as AnyBattleUnit[],
		removeAreaEffect: () => {},
		removeUnit: (unit: unknown) => removed.push(unit),
		notifyEnemyCastleHit: () => {},
		alliedFoodHooks: { consumeFood: () => true },
		random: () => random,
	} as unknown as BattleArmyHooks;
	const castleHits: number[] = [];
	const path = {
		getNodes: () => [],
		alliedCastle: { takeHit: (damage: number) => castleHits.push(damage) },
	} as unknown as BattlePath;
	const frog = new Frog(new Cell({ x: 0, y: 0 })).toBattle(new GridPosition({ x: 0, y: 0 }), path, hooks);
	return { frog, buffs, removed, castleHits, hooks };
};

const offered = (sciences: ReadonlySet<Science>) =>
	new RetailFiller(1, Math.random, sciences).candidates().some(({ blueprint }) => blueprint instanceof FrogBlueprint);

describe("Frog", () => {
	it("is an Epic, low and slow unit behind the Witchcraft science", () => {
		const { stats, rarity, requiredScience } = new Frog(new Cell({ x: 0, y: 0 })).blueprint;
		expect(rarity).toBe(Rarity.Epic);
		expect(requiredScience).toBe(Science.Witchcraft);
		expect(stats.health).toBe(25);
		expect(stats.castleDamage).toBe(2);
		expect(offered(new Set())).toBe(false);
		expect(offered(new Set([Science.Witchcraft]))).toBe(true);
	});

	it("on death gives a vitality stack and poisons one random enemy for 2 seconds", () => {
		const enemies = [new Enemy(), new Enemy(), new Enemy()];
		const { frog, buffs, removed } = setup(enemies, 0.5);
		frog.stats.takeDamage(100);

		expect(buffs.unitArmyBuff.getBuff("vitality")).toBe(1);
		expect(removed).toEqual([frog]);
		expect(enemies.map((enemy) => enemy.stats.conditions.has("poisoned"))).toEqual([false, true, false]);

		const victim = enemies[1] as Enemy;
		for (let tick = 0; tick < 80; tick++) victim.stats.conditions.get("poisoned")?.tick();
		expect(100 - victim.stats.health).toBeCloseTo(12);
		expect(victim.stats.conditions.has("poisoned")).toBe(false);
	});

	it("still gives its vitality stack when no enemy is left to poison", () => {
		const { frog, buffs } = setup([new Enemy(false)]);
		frog.stats.takeDamage(100);
		expect(buffs.unitArmyBuff.getBuff("vitality")).toBe(1);
	});

	it("does not die on reaching the castle: it hits it and leaves without its death effect", () => {
		const enemy = new Enemy();
		const { frog, buffs, removed, castleHits } = setup([enemy]);
		frog.attackCastle();

		expect(castleHits).toEqual([2]);
		expect(removed).toEqual([frog]);
		expect(buffs.unitArmyBuff.getBuff("vitality")).toBe(0);
		expect(enemy.stats.conditions.has("poisoned")).toBe(false);
	});

	it("hops: stands still between hops, and its speed averages 1 over a hop and its rest", () => {
		expect(HOP_SPEED.reduce((sum, value) => sum + value, 0) / HOP_SPEED.length).toBeCloseTo(1);
		expect(Math.max(...HOP_SPEED)).toBeGreaterThan(2);
		expect(HOP_SPEED.filter((value) => value === 0)).toHaveLength(HOP_SPEED.length / 2);
	});

	it("covers as much ground as its movement speed says, but in hops", () => {
		const { frog } = setup([]);
		frog.pathFinder.destinations = [new GridPosition({ x: 1000, y: 0 })];
		const cycle = HOP_SPEED.length;
		const walked: number[] = [];
		for (let tick = 0; tick < 3 * cycle; tick++) {
			const before = frog.position.x;
			frog.tick();
			walked.push(frog.position.x - before);
		}
		const distancePerTick = movementSpeedToDistancePerTick(frog.stats.movementSpeed);
		const total = walked.reduce((sum, step) => sum + step, 0);
		expect(total).toBeCloseTo(3 * cycle * distancePerTick, 3);
		expect(walked.filter((step) => step === 0).length).toBeGreaterThanOrEqual(3 * (cycle / 2) - 3);
	});

	describe("poison stacking", () => {
		const scenario = (cauldrons: number) => {
			const enemy = new Enemy();
			const { frog, buffs, hooks } = setup([enemy]);
			buffs.addPoisonDamagePercent(20 * cauldrons);
			const puddle = new WitchHouse(new Cell({ x: 5, y: 5 })).getAreaEffect(hooks, new GridPosition({ x: 0, y: 0 }));
			const poison = () => enemy.stats.conditions.get("poisoned") as Poisoned;
			const lost: number[] = [];
			// One tick: the puddle poisons what stands in it, then the enemy's statuses tick.
			const tick = () => {
				const before = enemy.stats.health;
				puddle.tick();
				const afterPuddle = poison()?.remaining;
				enemy.stats.tick();
				lost.push(before - enemy.stats.health);
				return afterPuddle;
			};
			return { enemy, frog, puddle, poison, tick, lost };
		};

		it("a puddle refreshes the poison to 70 ticks each tick without making it longer", () => {
			const { poison, tick } = scenario(0);
			for (let i = 0; i < 32; i++) expect(tick()).toBe(70);
			expect(poison().remaining).toBe(69);
		});

		it("a Frog adds its 2 s on top, and the puddle then adds nothing while more than 70 ticks remain", () => {
			const { enemy, frog, poison, tick } = scenario(0);
			for (let i = 0; i < 32; i++) tick();
			expect(poison().remaining).toBe(69);

			frog.stats.takeDamage(100);
			expect(poison().remaining).toBe(69 + 64);

			// The puddle strikes again: already above 70 ticks, so it adds nothing.
			expect(tick()).toBe(69 + 64);
			expect(poison().remaining).toBe(69 + 64 - 1);

			// Out of the puddle (it is not ticked any more), the poison runs out after the added time.
			for (let i = 0; i < 132; i++) enemy.stats.tick();
			expect(enemy.stats.conditions.has("poisoned")).toBe(false);
		});

		it("a Frog's poison on a standing puddle's poison does the same damage per tick, with the Cauldron's bonus on both", () => {
			const { frog, tick, lost } = scenario(1);
			for (let i = 0; i < 32; i++) tick();
			frog.stats.takeDamage(100);
			for (let i = 0; i < 40; i++) tick();
			expect(lost).toHaveLength(72);
			for (const damage of lost) expect(damage).toBeCloseTo((6 * 1.2) / 32);
		});
	});
});
