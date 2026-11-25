// Loaded first: the piece modules run into the engine's grid <-> render traits import cycle otherwise.
import "../../../match-maker/board-serializer";
import { Cell, GridPosition } from "../../../../shared/position";
import { ArmyBuff } from "../../../army/battle/army-buff";
import { Rarity } from "../../../../shared/traits/engine/rarity";
import { Science } from "../../../../shared/traits/engine/science";
import { Stats } from "../../../stats/stats";
import { Frog } from "../../recruit/implementation/frog";
import { Poisoned } from "../../../area-effect/implementation/poison-ground";
import { RetailFiller } from "../../../shop/retail/retail-filler";
import { FrogBlueprint } from "../../blueprint/implementation/frog-blueprint";
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
		removeUnit: (unit: unknown) => removed.push(unit),
		notifyEnemyCastleHit: () => {},
		random: () => random,
	} as unknown as BattleArmyHooks;
	const castleHits: number[] = [];
	const path = {
		getNodes: () => [],
		alliedCastle: { takeHit: (damage: number) => castleHits.push(damage) },
	} as unknown as BattlePath;
	const frog = new Frog(new Cell({ x: 0, y: 0 })).toBattle(new GridPosition({ x: 0, y: 0 }), path, hooks);
	return { frog, buffs, removed, castleHits };
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
});
