import { Derive } from "@ddd-ts/traits";
import { Butchery } from "../../recruit/implementation/butchery";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../../shared/position";
import { Cast } from "../../../../../shared/traits/engine/cast";
import { CasterTotem } from "../battle-totem";
import { HTSynergy } from "../../../../../shared/traits/engine/synergy";
import { TStatsRenderable } from "../../../../../shared/traits/render/huds/stat-renderable";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";
import { BattleStartTrigger } from "../../../../../shared/traits/engine/battle-start";
import { implementsTrait } from "@ddd-ts/traits";
import { hasTag } from "../../../../../shared/traits/engine/tags/tagged";
import type { Buff } from "../../../../army/battle/army-buff";
import { BattleBarrack } from "../../../barrack/battle/battle-barrack";
import type { AnyBattleUnit } from "../../../../units/battle/battle-unit";

export const SACRIFICE_BUFF_POOL: readonly { side: "unit" | "tower"; buff: Buff }[] = [
	{ side: "unit", buff: "movement-speed" },
	{ side: "unit", buff: "cast-speed" },
	{ side: "unit", buff: "vitality" },
	{ side: "tower", buff: "projectile-damage" },
	{ side: "tower", buff: "cast-speed" },
];

export class BattleButchery extends Derive(CasterTotem, HTSynergy, TStatsRenderable, BattleStartTrigger) {
	constructor(
		public butchery: Butchery,
		readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		override orientation: BoardOrientation,
	) {
		super({
			synergy: butchery,
			imageDrawable: butchery,
			hitboxHolder: butchery,
			tagHolder: butchery,
			rarityHolder: butchery,
			casterRecruit: butchery,
			battleStartRecruit: butchery,
			maxHealth: butchery.stats.health,
			castleDamage: butchery.stats.castleDamage,
			projectileDamage: butchery.stats.projectileDamage,
			attackSpeed: butchery.stats.attackSpeed,
			movementSpeed: butchery.stats.speed,
			castSpeed: butchery.stats.castSpeed,
			foodCost: butchery.stats.foodConsumptionOnCast,
			range: butchery.stats.range,
			onDeath: () => {},
			descriptor: butchery,
		});
		this.gridShape = butchery.gridShape;
	}

	tick() {
		this.stats.tick();
		this.tickCast();
	}

	// An animal barrack on the star produces faster by a flat amount, added to its own production speed.
	onBattleStart() {
		const [neighbor] = this.hooks.gridHooks.getRelativeNeighborsInArmy(
			this.cell,
			this.patternEffect.getRelativeCells(this.orientation),
		);
		if (neighbor && implementsTrait(neighbor, BattleBarrack) && hasTag(neighbor.bondedUnit, "Animal")) {
			neighbor.stats.flatStat.castSpeed += this.butchery.blueprint.productionSpeedBonus;
		}
	}

	private pickIndex(length: number) {
		return Math.min(Math.floor(this.hooks.random() * length), length - 1);
	}

	// A random allied animal, from the battle's seeded random. Undefined when none is alive.
	victim(): AnyBattleUnit | undefined {
		const animals = this.hooks.getAlliedUnits().filter((unit) => hasTag(unit, "Animal"));
		return animals[this.pickIndex(animals.length)];
	}

	// The sacrifice leaves the battle like a unit reaching the castle: no on-death effect, no damage, no refund.
	// With no animal alive nothing happens and the timer starts over.
	onCastResolve() {
		const victim = this.victim();
		if (victim) {
			this.hooks.removeUnit(victim);
			for (let i = 0; i < this.butchery.blueprint.buffsPerSacrifice; i++) {
				const { side, buff } = SACRIFICE_BUFF_POOL[this.pickIndex(SACRIFICE_BUFF_POOL.length)]!;
				if (side === "unit") this.hooks.alliedArmyBuffHooks.addUnitBuff(buff as never);
				else this.hooks.alliedArmyBuffHooks.addTowerBuff(buff as never);
			}
		}
		this.finishCast();
	}

	casts() {
		this.castInProgress = new Cast(this, this.onCastResolve.bind(this));
	}
}
