import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../../shared/position";
import { CasterTotem } from "../battle-totem";
import { Cauldron } from "../../recruit/implementation/cauldron";
import { BattleStartTrigger } from "../../../../../shared/traits/engine/battle-start";
import { Cast } from "../../../../../shared/traits/engine/cast";
import { Poisoned } from "../../../../area-effect/implementation/poison-ground";
import { secondsToFrame } from "../../../../../shared/seconds";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";

export class BattleCauldron extends Derive(CasterTotem, BattleStartTrigger) {
	constructor(
		public cauldron: Cauldron,
		readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		override orientation: BoardOrientation,
	) {
		super({
			tagHolder: cauldron,
			rarityHolder: cauldron,
			imageDrawable: cauldron,
			hitboxHolder: cauldron,
			battleStartRecruit: cauldron,
			casterRecruit: cauldron,
			maxHealth: cauldron.stats.health,
			castleDamage: cauldron.stats.castleDamage,
			projectileDamage: cauldron.stats.projectileDamage,
			attackSpeed: cauldron.stats.attackSpeed,
			movementSpeed: cauldron.stats.speed,
			castSpeed: cauldron.stats.castSpeed,
			foodCost: cauldron.stats.foodConsumptionOnCast,
			range: cauldron.stats.range,
			onDeath: () => {},
			descriptor: cauldron,
		});
		this.gridShape = cauldron.gridShape;
	}

	onBattleStart() {
		this.hooks.alliedArmyBuffHooks.addPoisonDamagePercent(this.cauldron.blueprint.poisonDamagePercent);
	}

	tick() {
		this.stats.tick();
		this.tickCast();
	}

	casts() {
		this.castInProgress = new Cast(this, this.onCastResolve.bind(this));
	}

	// Poisons one random living enemy unit, drawn from the battle's seeded random, with no food cost.
	onCastResolve() {
		const enemies = this.hooks.getEnemyUnits().filter((enemy) => enemy.isAlive());
		const victim = enemies[Math.min(Math.floor(this.hooks.random() * enemies.length), enemies.length - 1)];
		victim?.addCondition(Poisoned.by(this.hooks, "add", secondsToFrame(this.cauldron.blueprint.poisonSeconds)));
		this.finishCast();
	}
}
