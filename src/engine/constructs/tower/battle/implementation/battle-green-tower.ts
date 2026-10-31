import { Derive } from "@ddd-ts/traits";
import { Physic } from "../../../../../shared/physic";
import { GreenTower } from "../../recruit/implementation/green-tower";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../../shared/position";
import { AnyBattleUnit } from "../../../../units/battle/battle-unit";
import { BattleTower } from "../battle-tower";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";

export class GreenBattleTower extends Derive(BattleTower) {
	target = null as null | AnyBattleUnit;
	constructor(
		private readonly recruit: GreenTower,
		private readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		orientation: BoardOrientation,
	) {
		super({
			orientation,
			recruit,
			casterRecruit: recruit,
			imageDrawable: recruit,
			maxHealth: recruit.stats.health,
			attack: recruit.stats.damage,
			movementSpeed: recruit.stats.speed,
			attackSpeed: recruit.stats.attackSpeed,
			castSpeed: recruit.stats.castSpeed,
			foodCost: recruit.stats.foodConsumptionOnCast,
			range: recruit.stats.range,
			onDeath: () => {},
			hitboxHolder: recruit,
			descriptor: recruit,
			tagHolder: recruit,
			rarityHolder: recruit,
		});
	}

	private attack(target: AnyBattleUnit) {
		const sucess = this.hooks.alliedFoodHooks.consumeFood(this.stats.foodCost);
		if (sucess) {
			const projectile = this.recruit.getProjectile(this.hooks, target, this.position, this.stats.attack);
			this.hooks.addProjectile(projectile, this);
		}
		this.finishCast(sucess);
	}

	private doesTargetMatchesRule(enemyUnit: AnyBattleUnit, distanceSqrd: number) {
		return enemyUnit.isAlive() && distanceSqrd < 20 * 20;
	}

	setTarget(enemyUnit: AnyBattleUnit | null) {
		this.target = enemyUnit;
	}

	onCastResolve(): void {
		if (
			this.target &&
			this.doesTargetMatchesRule(this.target, Physic.getDistanceSqrd(this.position, this.target.position))
		) {
			this.attack(this.target);
			return;
		}
		const target = this.hooks.searchTarget(this.position, this.doesTargetMatchesRule);
		this.setTarget(target);
		if (this.target) {
			this.attack(this.target);
			return;
		}
	}
}
